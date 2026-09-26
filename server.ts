import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

// Initialize GoogleGenAI SDK on server side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to extract arXiv ID
function extractArxivId(input: string): string | null {
  const clean = input.trim();
  const match = clean.match(/(?:arxiv\.org\/(?:abs|pdf)\/|arxiv:)?([0-9]{4}\.[0-9]{4,5}(?:v[0-9]+)?|[a-z\-]+(?:\.[a-z]{2})?\/[0-9]{7})/i);
  return match ? match[1].replace('.pdf', '') : null;
}

// Fetch arXiv metadata via export.arxiv.org API
async function fetchArxivMeta(arxivId: string) {
  try {
    const url = `https://export.arxiv.org/api/query?id_list=${arxivId}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'PaperBlueprint-ResearchAgent/1.0' } });
    if (!res.ok) return null;
    const xml = await res.text();

    const titleMatch = xml.match(/<title>([\s\S]*?)<\/title>/g);
    // index 0 is feed title, index 1 is paper title
    const rawTitle = titleMatch && titleMatch[1] ? titleMatch[1].replace(/<\/?title>/g, '').trim().replace(/\s+/g, ' ') : '';
    
    const summaryMatch = xml.match(/<summary>([\s\S]*?)<\/summary>/);
    const abstract = summaryMatch ? summaryMatch[1].trim().replace(/\s+/g, ' ') : '';

    const authorMatches = [...xml.matchAll(/<author>\s*<name>([\s\S]*?)<\/name>/g)].map(m => m[1].trim());
    
    const publishedMatch = xml.match(/<published>([\s\S]*?)<\/published>/);
    const publishedDate = publishedMatch ? publishedMatch[1].substring(0, 10) : '';

    const categoryMatch = xml.match(/<arxiv:primary_category[^>]*term="([^"]+)"/);
    const category = categoryMatch ? categoryMatch[1] : '';

    if (rawTitle) {
      return {
        arxivId,
        title: rawTitle,
        abstract,
        authors: authorMatches.slice(0, 6),
        publishedDate,
        category,
        url: `https://arxiv.org/abs/${arxivId}`,
        pdfUrl: `https://arxiv.org/pdf/${arxivId}.pdf`,
      };
    }
  } catch (err) {
    console.warn('arXiv API fetch error:', err);
  }
  return null;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // arXiv quick resolve endpoint
  app.post('/api/arxiv/resolve', async (req, res) => {
    try {
      const { input } = req.body;
      if (!input) return res.status(400).json({ error: 'Input required' });
      const arxivId = extractArxivId(input);
      if (!arxivId) return res.json({ resolved: false });

      const meta = await fetchArxivMeta(arxivId);
      if (meta) {
        return res.json({ resolved: true, meta });
      }
      return res.json({ resolved: false, arxivId });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Primary Agent Analysis Endpoint
  app.post('/api/research/analyze', async (req, res) => {
    try {
      const { paperInput, paperType = 'url' } = req.body;

      if (!paperInput || typeof paperInput !== 'string') {
        return res.status(400).json({ error: 'Please provide a valid research paper URL, arXiv ID, or title.' });
      }

      // Check if arXiv ID is present
      const arxivId = extractArxivId(paperInput);
      let arxivMeta: any = null;
      if (arxivId) {
        arxivMeta = await fetchArxivMeta(arxivId);
      }

      // Operational Constraint System Prompt
      const systemInstruction = `You are an advanced Computer Science Research Agent specializing in parsing academic papers, extracting system architectures, and identifying student developer opportunities.

OPERATIONAL CONSTRAINTS:
- You must always prioritize token efficiency. Ensure your total analysis and tool execution stays well under 25,000 tokens - if a paper is too long to ingest entirely, use the Web Search tool to look up summaries, abstracts, and open-source implementations (e.g. GitHub) of the paper's title to gather context efficiently.

When a user provides a research paper URL or title, execute these steps:
1. CORE CONCEPT EXTRACTION:
Summarize the problem statement, the primary methodology introduced, and the key mathematical/algorithmic breakthroughs in under 300 words using plain, accessible language. Ensure the total word count of this section is strictly under 300 words.

2. ARCHITECTURAL FLOWCHART (Mermaid.js):
Generate a clean, syntactically correct Mermaid.js flowchart (graph TD) that charts the components, data inputs, model layers, and data outputs of the system described in the paper. Do not use Markdown code blocks inside the Mermaid string itself; output it as a clear text segment labeled [FLOWCHART].
CRITICAL FOR MERMAID SYNTAX:
- Use 'graph TD' as the first line.
- Node IDs must be alphanumeric without spaces (e.g. In1["Input Tokens"], Layer1["Multi-Head Attention"]).
- Avoid parentheses or brackets inside label quotes unless escaped.
- Group logical stages with subgraphs if helpful (e.g., subgraph Inputs, subgraph Encoder, subgraph Decoder, subgraph Outputs).
- Ensure it is 100% syntactically valid in Mermaid.js v10+.

3. FUTURE WORK & INTERNSHIP OPPORTUNITIES:
Brainstorm 3 concrete, realistic ways a 3rd-year CS student could build upon, extend, or optimize this paper for a resume project. For each idea provide:
- The exact extension (e.g., "Replacing the heavy transformer layer with a lightweight Mamba block for edge deployment")
- The targeted performance metric (e.g., latency reduction, accuracy trade-off)
- The recommended techstack (e.g., PyTorch, ONNX Runtime).

In addition, provide:
- Catchy project title
- Implementation difficulty (e.g., "Intermediate (3-5 weeks)")
- A polished, metric-driven resume bullet point tailored for a FAANG / AI research internship application
- A 4-step milestone roadmap for execution
- A brief starter snippet or pseudocode showing where the layer modification or optimization hook plugs into standard PyTorch.

Output format:
Return a JSON object matching this schema:
{
  "rawOutput": string, // The verbatim text formatted with sections: CORE CONCEPT EXTRACTION, [FLOWCHART], and FUTURE WORK & INTERNSHIP OPPORTUNITIES
  "paper": {
    "title": string,
    "authors": string[],
    "year": string,
    "venue": string,
    "url": string,
    "primaryDomain": string,
    "keyKeywords": string[]
  },
  "coreConcept": {
    "problemStatement": string,
    "primaryMethodology": string,
    "keyBreakthroughs": string,
    "wordCount": number,
    "accessibleSummary": string
  },
  "flowchart": {
    "mermaidCode": string, // Pure graph TD string without markdown code fences
    "architectureExplanation": string,
    "componentsList": [
      { "name": string, "category": "Input" | "Layer" | "Optimization" | "Output" | "Memory", "role": string }
    ]
  },
  "studentOpportunities": [
    {
      "id": string,
      "title": string,
      "exactExtension": string,
      "targetedMetric": string,
      "recommendedTechstack": string[],
      "difficulty": string,
      "resumeBullet": string,
      "roadmap": string[],
      "starterSnippet": string
    }
  ]
}`;

      let userPrompt = `Research paper to analyze:\nInput: "${paperInput}"`;
      if (arxivMeta) {
        userPrompt += `\n\nFetched arXiv Metadata:\nTitle: ${arxivMeta.title}\nAuthors: ${arxivMeta.authors.join(', ')}\nPublished: ${arxivMeta.publishedDate}\nAbstract: ${arxivMeta.abstract}\nURL: ${arxivMeta.url}`;
      }

      // Use gemini-3.8-flash with googleSearch tool for token-efficient grounding
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text || '';
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(responseText);
      } catch (parseErr) {
        // Fallback cleanup if response has extraneous markdown
        const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
        parsedData = JSON.parse(cleaned);
      }

      // Compute token metrics
      const usage = response.usageMetadata || {};
      const promptTokens = usage.promptTokenCount || 0;
      const candidatesTokens = usage.candidatesTokenCount || 0;
      const totalTokens = usage.totalTokenCount || (promptTokens + candidatesTokens);
      const TOKEN_BUDGET = 25000;
      const budgetUsedPercent = Math.min(100, Math.round((totalTokens / TOKEN_BUDGET) * 1000) / 10);

      // Clean up flowchart if wrapped in fences or [FLOWCHART]
      let mermaidCode = parsedData.flowchart?.mermaidCode || '';
      mermaidCode = mermaidCode
        .replace(/```mermaid/gi, '')
        .replace(/```/g, '')
        .replace(/^\[FLOWCHART\]\s*/i, '')
        .trim();

      // Ensure graph TD exists
      if (!mermaidCode.startsWith('graph ') && !mermaidCode.startsWith('flowchart ')) {
        mermaidCode = 'graph TD\n' + mermaidCode;
      }

      // Update cleaned mermaid code
      if (parsedData.flowchart) {
        parsedData.flowchart.mermaidCode = mermaidCode;
      }

      // Construct verbatim rawOutput if not already present
      if (!parsedData.rawOutput) {
        const p1 = `CORE CONCEPT EXTRACTION:\nProblem: ${parsedData.coreConcept?.problemStatement || ''}\nMethodology: ${parsedData.coreConcept?.primaryMethodology || ''}\nBreakthroughs: ${parsedData.coreConcept?.keyBreakthroughs || ''}`;
        const p2 = `[FLOWCHART]\n${mermaidCode}`;
        const p3 = `FUTURE WORK & INTERNSHIP OPPORTUNITIES:\n` +
          (parsedData.studentOpportunities || []).map((o: any, idx: number) => 
            `${idx + 1}. ${o.title}\n- Extension: ${o.exactExtension}\n- Target Metric: ${o.targetedMetric}\n- Tech Stack: ${o.recommendedTechstack?.join(', ')}`
          ).join('\n\n');
        parsedData.rawOutput = `${p1}\n\n${p2}\n\n${p3}`;
      }

      // Token efficiency report
      const tokenAudit = {
        promptTokens,
        candidatesTokens,
        totalTokens,
        tokenBudget: TOKEN_BUDGET,
        budgetUsedPercent,
        isUnderBudget: totalTokens <= TOKEN_BUDGET,
        savedTokensEstimate: Math.max(0, 45000 - totalTokens), // Ingesting full 15-page PDF is ~40k-60k tokens
        efficiencyRating: totalTokens < 8000 ? 'Optimal (Superior Efficiency)' : totalTokens < 18000 ? 'Good' : 'Approaching Limit',
      };

      res.json({
        success: true,
        data: parsedData,
        tokenAudit,
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      res.status(500).json({
        error: error.message || 'Failed to analyze paper. Please check the URL or try again.',
      });
    }
  });

  // Interactive Q&A with the Research Agent about the paper
  app.post('/api/research/chat', async (req, res) => {
    try {
      const { paperTitle, paperContext, question, conversationHistory = [] } = req.body;

      if (!question) {
        return res.status(400).json({ error: 'Question is required' });
      }

      const systemInstruction = `You are an advanced Computer Science Research Agent. You are mentoring a 3rd-year CS student on understanding the academic paper "${paperTitle}" and building a resume-worthy project or internship submission based on its architecture.
Be precise, mathematically sound, yet encouraging and accessible. If asked for code, provide clean, idiomatic PyTorch or Python code with inline comments explaining architectural trade-offs.`;

      const contents = [
        ...conversationHistory.map((m: any) => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
        {
          role: 'user',
          parts: [{ text: `Paper Context: ${JSON.stringify(paperContext || {})}\n\nStudent Question: ${question}` }],
        },
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || '';
      res.json({ reply });
    } catch (error: any) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message || 'Error processing question.' });
    }
  });

  // Vite or static serving
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

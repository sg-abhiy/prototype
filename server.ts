import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI if key is present
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: 'gemini-3.8-flash',
  });
});

// Gemini Structured Generation Endpoint
app.post('/api/gemini/generate', async (req: Request, res: Response): Promise<void> => {
  const { prompt, systemInstruction, responseSchema, useSearchGrounding } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'Prompt is required and must be a string' });
    return;
  }

  const ai = getGenAIClient();
  if (!ai) {
    res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server. Falling back to operational demo mode.',
      demoMode: true,
    });
    return;
  }

  try {
    const config: Record<string, any> = {};

    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    if (useSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
      // When googleSearch is active with structured data, we avoid responseMimeType to prevent API conflicts
      // unless responseSchema is explicitly supported without grounding.
      // Instead, we instruct the model in prompt/systemInstruction to return strict JSON markdown.
    } else if (responseSchema) {
      config.responseMimeType = 'application/json';
      config.responseSchema = responseSchema;
    } else {
      config.responseMimeType = 'application/json';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config,
    });

    const rawText = response.text || '';
    
    // Extract grounding URLs and chunks if present
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const webSources = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => ({
        url: chunk.web.uri,
        title: chunk.web.title || chunk.web.uri,
      }));

    // Clean up text if enclosed in markdown code fences
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    let parsedData = null;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch {
      // Return raw text if not valid JSON
      parsedData = { text: rawText };
    }

    res.json({
      success: true,
      data: parsedData,
      rawText,
      sources: webSources,
      searchQueries: groundingMetadata?.webSearchQueries || [],
    });
  } catch (error: any) {
    console.error('Gemini API execution error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate content with Gemini',
      demoMode: true,
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ProblemForge server running on http://0.0.0.0:${PORT} (${isProduction ? 'prod' : 'dev'})`);
  });
}

startServer();

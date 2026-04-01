import { Hono } from 'hono';
import { callQwen, StepAnalysisRequest } from './ai';

interface Env {
  DASHSCOPE_API_KEY: string;
  ALLOWED_ORIGINS: string;
  DASHSCOPE_BASE_URL: string;
  QWEN_CHAT_MODEL: string;
}

const app = new Hono<{ Bindings: Env }>();

function getAllowedOrigins(env: Env): string[] {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

function corsHeaders(origin: string, allowedOrigins: string[]): Record<string, string> {
  const allowed = allowedOrigins.includes(origin) ? origin : allowedOrigins[0] ?? '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };
}

// Handle preflight
app.options('*', (c) => {
  const origin = c.req.header('Origin') ?? '';
  const allowedOrigins = getAllowedOrigins(c.env);
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin, allowedOrigins)
  });
});

// Health check
app.get('/', (c) => {
  return c.json({ service: 'bbb-worker', status: 'ok', version: '1.0.0' });
});

// POST /ai/analyze
app.post('/ai/analyze', async (c) => {
  const origin = c.req.header('Origin') ?? '';
  const allowedOrigins = getAllowedOrigins(c.env);
  const headers = corsHeaders(origin, allowedOrigins);

  if (!c.env.DASHSCOPE_API_KEY) {
    return c.json({ error: 'DASHSCOPE_API_KEY not configured' }, 500, headers);
  }

  let body: StepAnalysisRequest;
  try {
    body = await c.req.json<StepAnalysisRequest>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400, headers);
  }

  const { step, stepName, wizardData, contextData } = body;

  if (!step || !stepName) {
    return c.json({ error: 'step and stepName are required' }, 400, headers);
  }

  try {
    const narrative = await callQwen(c.env, { step, stepName, wizardData, contextData });
    return c.json({ narrative, step, stepName }, 200, headers);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[bbb-worker] AI error:', message);
    return c.json({ error: message }, 500, headers);
  }
});

// POST /ai/stream — SSE streaming version
app.post('/ai/stream', async (c) => {
  const origin = c.req.header('Origin') ?? '';
  const allowedOrigins = getAllowedOrigins(c.env);
  const corsH = corsHeaders(origin, allowedOrigins);

  if (!c.env.DASHSCOPE_API_KEY) {
    return c.json({ error: 'DASHSCOPE_API_KEY not configured' }, 500, corsH);
  }

  let body: StepAnalysisRequest;
  try {
    body = await c.req.json<StepAnalysisRequest>();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400, corsH);
  }

  const { step, stepName, wizardData, contextData } = body;

  if (!step || !stepName) {
    return c.json({ error: 'step and stepName are required' }, 400, corsH);
  }

  // For simplicity, call non-streaming and wrap in SSE
  try {
    const narrative = await callQwen(c.env, { step, stepName, wizardData, contextData });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send narrative in chunks
        const chunks = narrative.match(/.{1,100}/g) ?? [];
        for (const chunk of chunks) {
          const data = `data: ${JSON.stringify({ text: chunk })}\n\n`;
          controller.enqueue(encoder.encode(data));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsH,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return c.json({ error: message }, 500, corsH);
  }
});

export default app;

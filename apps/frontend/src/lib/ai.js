const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787';

export async function analyzeStep(step, stepName, wizardData, contextData = {}) {
  const res = await fetch(`${WORKER_URL}/ai/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ step, stepName, wizardData, contextData })
  });
  if (!res.ok) throw new Error(`Worker error: ${res.status}`);
  const json = await res.json();
  return json.narrative || '';
}

export function formatNarrative(text) {
  // Convert markdown-ish text to simple HTML spans
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h3>$1</h3>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, m => `<ul>${m}</ul>`);
}

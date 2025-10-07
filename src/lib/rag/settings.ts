/*
LlamaIndex references for future development and audits:
- Python SDK (llama_index): https://github.com/run-llama/llama_index
- TypeScript SDK (LlamaIndexTS): https://github.com/run-llama/LlamaIndexTS
- RAG reference patterns (rags): https://github.com/run-llama/rags

Purpose: Centralise LlamaIndex configuration for the Node/Next stack.
This module sets the default LLM and embedding model via LlamaIndex Settings.
Keep Python usage limited to offline tools (crawler/semantic splitter).
*/

import { Settings, OpenAI, OpenAIEmbedding } from 'llamaindex';

let configured = false;

export function configureLlamaIndex(): void {
  if (configured) return;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Proceed without provider wiring; callers should handle fallbacks.
    console.warn('[LlamaIndex] Missing OPENAI_API_KEY; LlamaIndex providers not initialised.');
    configured = true;
    return;
  }

  try {
    const llmModel = process.env.LI_LLM_MODEL || 'gpt-4o-mini';
    const embedModel = process.env.LI_EMBED_MODEL || 'text-embedding-3-small';

    // Set default LLM and embedding model for the app
    Settings.llm = new OpenAI({ apiKey, model: llmModel });
    Settings.embedModel = new OpenAIEmbedding({ apiKey, model: embedModel });

    configured = true;
  } catch (error) {
    console.warn('[LlamaIndex] Failed to configure Settings:', (error as Error)?.message || error);
    configured = true; // Avoid repeated attempts; callers still have fallbacks
  }
}

export default configureLlamaIndex;

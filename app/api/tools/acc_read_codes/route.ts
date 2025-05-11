import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = 'asst_t9kwZqGL1NVSWXTnwwxU8TCq';

// Helper to call OpenAI API
async function openaiFetch(path: string, options: RequestInit) {
  const res = await fetch(`https://api.openai.com/v1${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'OpenAI-Beta': 'assistants=v2',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { note } = await req.json();
    if (!note) {
      return NextResponse.json({ error: 'Missing note' }, { status: 400 });
    }

    // 1. Create a thread
    const thread = await openaiFetch('/threads', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const thread_id = thread.id;

    // 2. Add a message to the thread
    await openaiFetch(`/threads/${thread_id}/messages`, {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
        content: note,
      }),
    });

    // 3. Run the thread with the assistant
    const run = await openaiFetch(`/threads/${thread_id}/runs`, {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    });
    const run_id = run.id;

    // 4. Poll for completion
    let status = run.status;
    let attempts = 0;
    while (status !== 'completed' && status !== 'failed' && attempts < 30) {
      await new Promise(r => setTimeout(r, 1500));
      const runStatus = await openaiFetch(`/threads/${thread_id}/runs/${run_id}`, {
        method: 'GET',
      });
      status = runStatus.status;
      attempts++;
    }
    if (status !== 'completed') {
      return NextResponse.json({ error: 'OpenAI run did not complete' }, { status: 500 });
    }

    // 5. Retrieve the messages from the thread
    const messagesRes = await openaiFetch(`/threads/${thread_id}/messages`, {
      method: 'GET',
    });
    const messages = messagesRes.data || [];
    const assistantMsg = messages.find((m: any) => m.role === 'assistant');
    if (!assistantMsg || !assistantMsg.content || !assistantMsg.content[0]?.text) {
      return NextResponse.json({ error: 'No assistant response' }, { status: 500 });
    }

    // 6. Parse the response for ACC code suggestions
    // Expecting a list of objects: { text, read_code }
    let suggestions: { text: string; read_code: string }[] = [];
    try {
      // Try to parse as JSON
      let jsonText = '';
      if (typeof assistantMsg.content[0].text === 'string') {
        jsonText = assistantMsg.content[0].text;
      } else if (assistantMsg.content[0].text && typeof assistantMsg.content[0].text.value === 'string') {
        jsonText = assistantMsg.content[0].text.value;
      }
      suggestions = JSON.parse(jsonText);
      if (!Array.isArray(suggestions)) {
        throw new TypeError('Not an array');
      }
    } catch {
      // Fallback: try to extract from text
      // TODO: Regex warning about possible backtracking remains; review if needed
      let text = '';
      if (Array.isArray(assistantMsg.content)) {
        const textObj = assistantMsg.content.find((c: any) => c.type === 'text');
        if (textObj) {
          if (typeof textObj.text === 'string') {
            text = textObj.text;
          } else if (typeof textObj.text === 'object' && typeof textObj.text.value === 'string') {
            text = textObj.text.value;
          }
        }
      }
      if (typeof text !== 'string') {
        text = '';
      }
      const lines = text.split('\n').filter(Boolean);
      suggestions = lines.map((line: string) => {
        // e.g. "Ankle sprain (N123)"
        // eslint-disable-next-line regexp/no-super-linear-backtracking
        const match = line.match(/^(.*?)\s*\(([^()\s]+)\)$/);
        if (match) {
          return { text: match[1]?.trim() ?? '', read_code: match[2]?.trim() ?? '' };
        }
        return null;
      }).filter(Boolean) as { text: string; read_code: string }[];
    }

    console.log('Assistant message content:', assistantMsg.content);
    console.log('Suggestions returned:', suggestions);

    return NextResponse.json({ suggestions });
  } catch (err: any) {
    console.error('ACC Read Codes API Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

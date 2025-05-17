import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = 'asst_t9kwZqGL1NVSWXTnwwxU8TCq';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      console.error('Query is required.');
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    // 1. Create a thread
    let threadId = null;
    try {
      const threadRes = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({}),
      });
      const thread = await threadRes.json();
      threadId = thread.id;
      if (!threadId) {
        console.error('Failed to create thread:', thread);
        return NextResponse.json({ error: 'Failed to create thread', details: thread }, { status: 500 });
      }
    } catch {
      console.error('Error creating thread');
      return NextResponse.json({ error: 'Error creating thread' }, { status: 500 });
    }

    // 2. Add the query as a message
    try {
      const msgRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          role: 'user',
          content: query,
        }),
      });
      const msgData = await msgRes.json();
      if (!msgRes.ok) {
        console.error('Failed to add message:', msgData);
        return NextResponse.json({ error: 'Failed to add message', details: msgData }, { status: 500 });
      }
    } catch {
      console.error('Error adding message');
      return NextResponse.json({ error: 'Error adding message' }, { status: 500 });
    }

    // 3. Run the assistant
    let runId = null;
    try {
      const runRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID,
          instructions: `Given the following consultation note, return the top 5 best-matching ACC codes from acc_read_codes. For each, return: "text" (preferred term), "read_code" (code), and "read_term" (read term or synonym if available). Output a JSON array of up to 5 objects, sorted by relevance. Only use codes from acc_read_codes.`,
        }),
      });
      const run = await runRes.json();
      runId = run.id;
      if (!runId) {
        console.error('Failed to start run:', run);
        return NextResponse.json({ error: 'Failed to start run', details: run }, { status: 500 });
      }
    } catch {
      console.error('Error starting run');
      return NextResponse.json({ error: 'Error starting run' }, { status: 500 });
    }

    // 4. Poll for completion
    let runStatus = 'queued';
    let attempts = 0;
    let lastStatusData = null;
    while (runStatus !== 'completed' && attempts < 20) {
      await new Promise(res => setTimeout(res, 1500));
      try {
        const statusRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        });
        const statusData = await statusRes.json();
        lastStatusData = statusData;
        runStatus = statusData.status;
        if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
          console.error('Assistant run failed:', runStatus, statusData);
          return NextResponse.json({ error: `Assistant run failed: ${runStatus}`, details: statusData }, { status: 500 });
        }
      } catch {
        console.error('Error polling run status');
        return NextResponse.json({ error: 'Error polling run status' }, { status: 500 });
      }
      attempts++;
    }
    if (runStatus !== 'completed') {
      console.error('Run did not complete in time:', lastStatusData);
      return NextResponse.json({ error: 'Assistant run did not complete in time', details: lastStatusData }, { status: 500 });
    }

    // 5. Get the assistant's response
    let messagesData = null;
    try {
      const messagesRes = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      });
      messagesData = await messagesRes.json();
      if (!messagesRes.ok) {
        console.error('Failed to fetch messages:', messagesData);
        return NextResponse.json({ error: 'Failed to fetch messages', details: messagesData }, { status: 500 });
      }
    } catch {
      console.error('Error fetching messages');
      return NextResponse.json({ error: 'Error fetching messages' }, { status: 500 });
    }
    const assistantMessages = messagesData.data
      .filter((msg: any) => msg.role === 'assistant')
      .sort((a: any, b: any) => b.created_at - a.created_at);
    const lastMessage = assistantMessages[0];
    if (!lastMessage) {
      console.error('No assistant message found:', messagesData);
      return NextResponse.json({ error: 'No assistant message found', details: messagesData }, { status: 500 });
    }
    let results = null;
    try {
      results = typeof lastMessage.content[0].text.value === 'string'
        ? JSON.parse(lastMessage.content[0].text.value)
        : lastMessage.content[0].text.value;
    } catch {
      console.error('Failed to parse assistant response:', lastMessage.content[0].text.value);
      return NextResponse.json({ error: 'Failed to parse assistant response' }, { status: 500 });
    }
    if (!Array.isArray(results)) {
      console.error('Assistant response is not an array:', results);
      return NextResponse.json({ error: 'Assistant response is not an array', results }, { status: 500 });
    }
    return NextResponse.json({ results });
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'OpenAI API error';
    console.error('Catch error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

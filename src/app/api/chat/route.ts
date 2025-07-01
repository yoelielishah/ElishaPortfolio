import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  let body;
  try {
    // console.log('Received body:', body);
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400 });
  }

  const messages = body?.messages;
  if (!Array.isArray(messages)) {
    return new Response('Missing or invalid messages array', { status: 400 });
  }

  // Prepare messages for OpenAI API
  const openAIMessages = messages.map((msg: any) => ({
    role: msg.role,
    content: msg.content || msg.parts?.map((p: any) => p.text).join(' ') || '',
  }));

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response('Missing OpenAI API key', { status: 500 });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: openAIMessages,
      stream: true,
    }),
  });

  return new Response(response.body, {
    status:200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

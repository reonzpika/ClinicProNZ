import { createClient } from '@deepgram/sdk';
import { NextResponse } from 'next/server';

if (!process.env.DEEPGRAM_API_KEY) {
  throw new Error('DEEPGRAM_API_KEY is not set in environment variables');
}

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export async function GET() {
  try {
    // List all projects
    const { result, error } = await deepgram.manage.getProjects();

    if (error) {
      throw error;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error listing Deepgram projects:', error);
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'Failed to list projects' },
      { status: 500 },
    );
  }
}

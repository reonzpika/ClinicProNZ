import Anthropic from '@anthropic-ai/sdk';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function POST(req: Request) {
  try {
    // Extract RBAC context and check authentication
    const context = await extractRBACContext(req);
    const permissionCheck = await checkCoreAccess(context);

    if (!permissionCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: permissionCheck.reason || 'Access denied',
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    // Authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { imageKey, patientSessionId, imageId } = await req.json();

    // Validate required fields
    if (!imageKey || !patientSessionId || !imageId) {
      return NextResponse.json({
        error: 'Missing required fields: imageKey, patientSessionId, imageId',
      }, { status: 400 });
    }

    // Validate that the key belongs to a consultation (security check)
    if (!imageKey.startsWith('consultations/')) {
      return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
    }

    // Generate presigned URL for Claude to access the image
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600, // 1 hour - plenty of time for Claude to access
    });

    // Clinical prompt template
    const systemPrompt = `You are a clinical AI assistant analysing medical images for healthcare documentation.

IMPORTANT GUIDELINES:
- This is a clinical documentation aid, not a diagnostic tool
- All observations should be verified by qualified healthcare professionals
- Focus on objective visual findings, not diagnostic conclusions
- Use professional medical terminology
- Be specific about anatomical locations and characteristics
- Include measurements or scale references when visible
- Flag any image quality issues that might affect interpretation

INSTRUCTIONS:
1. Provide a clear, clinical description of what you observe
2. Note any concerning findings that may require attention
3. Use professional medical terminology
4. Be specific about anatomical locations and characteristics
5. Include measurements or scale references when visible
6. Flag any image quality issues that might affect interpretation

Please analyse this clinical image and provide a comprehensive clinical description:`;

    // Call Claude Vision API with streaming
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for consistent clinical observations
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'url',
                url: presignedUrl,
              },
            },
            {
              type: 'text',
              text: 'Please provide a detailed clinical analysis of this image.',
            },
          ],
        },
      ],
      stream: true,
    });

    // Stream the response to the client
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          const initialData = JSON.stringify({
            imageId,
            status: 'processing',
            description: '',
          });
          controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

          let description = '';

          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              description += chunk.delta.text;

              // Send incremental update with safe JSON serialization
              try {
                const updateData = JSON.stringify({
                  imageId,
                  status: 'processing',
                  description,
                });
                controller.enqueue(encoder.encode(`data: ${updateData}\n\n`));
              } catch (jsonError) {
                console.error('Failed to serialize update data:', jsonError);
                // Send a safe fallback
                const safeUpdate = JSON.stringify({
                  imageId,
                  status: 'processing',
                  description: '[Processing...]',
                });
                controller.enqueue(encoder.encode(`data: ${safeUpdate}\n\n`));
              }
            }
          }

          // Send completion status with safe JSON serialization
          try {
            const completionData = JSON.stringify({
              imageId,
              status: 'completed',
              description,
              metadata: {
                processingTime: Date.now(),
                modelUsed: 'claude-3-5-sonnet-20241022',
              },
            });
            controller.enqueue(encoder.encode(`data: ${completionData}\n\n`));
          } catch (jsonError) {
            console.error('Failed to serialize completion data:', jsonError);
            // Send error status
            const errorData = JSON.stringify({
              imageId,
              status: 'error',
              error: 'Failed to process analysis result',
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
          }

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);

          // Send error status
          const errorData = JSON.stringify({
            imageId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Analysis failed',
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));

          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('AI analysis error:', error);

    // Handle timeout errors specifically
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json({
        error: 'Analysis timed out. Please try again.',
        code: 'TIMEOUT_ERROR',
      }, { status: 408 });
    }

    // Handle rate limiting
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json({
        error: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT_ERROR',
      }, { status: 429 });
    }

    return NextResponse.json({
      error: 'Failed to analyse image',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}

import { Buffer } from 'node:buffer';

import Anthropic from '@anthropic-ai/sdk';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

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

    // Validate that the key belongs to user's images (security check)
    if (!imageKey.startsWith('consultations/') && !imageKey.startsWith('mobile-uploads/') && !imageKey.startsWith('clinical-images/')) {
      return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
    }

    // Download image from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: imageKey,
    });

    const response = await s3Client.send(command);
    if (!response.Body) {
      return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 });
    }

    // Convert stream to buffer
    const imageBuffer = await response.Body.transformToByteArray();
    const buffer = Buffer.from(imageBuffer);

    // Validate that we have image data
    if (buffer.length === 0) {
      return NextResponse.json({ error: 'Retrieved image is empty' }, { status: 400 });
    }

    // Get image metadata and resize if needed
    let image, metadata;
    try {
      image = sharp(buffer);
      metadata = await image.metadata();

      if (!metadata.width || !metadata.height) {
        throw new Error('Invalid image: missing dimensions');
      }
    } catch (imageError) {
      console.error('Image processing error:', imageError);
      return NextResponse.json({
        error: 'Invalid image format or corrupted image file',
        code: 'INVALID_IMAGE_FORMAT',
      }, { status: 400 });
    }

    const MAX_DIMENSION = 8000; // Claude's maximum dimension
    let processedImage = image;

    console.log(`Image metadata: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

    // Check if image needs resizing
    if (metadata.width && metadata.height
      && (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION)) {
      console.log(`Image exceeds maximum dimension (${MAX_DIMENSION}px), resizing...`);

      // Calculate resize dimensions maintaining aspect ratio
      const aspectRatio = metadata.width / metadata.height;
      let newWidth, newHeight;

      if (metadata.width > metadata.height) {
        newWidth = Math.min(metadata.width, MAX_DIMENSION);
        newHeight = Math.round(newWidth / aspectRatio);
      } else {
        newHeight = Math.min(metadata.height, MAX_DIMENSION);
        newWidth = Math.round(newHeight * aspectRatio);
      }

      console.log(`Resizing to: ${newWidth}x${newHeight}`);

      processedImage = image.resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    } else {
      console.log('Image dimensions are within limits, no resizing needed');
    }

    // Convert to base64 (always as JPEG for consistency)
    let processedBuffer, base64Image;
    try {
      processedBuffer = await processedImage.jpeg({ quality: 90 }).toBuffer();
      base64Image = processedBuffer.toString('base64');

      const sizeKB = Math.round(base64Image.length / 1024);
      console.log(`Processed image size: ${sizeKB}KB`);

      // Claude has a ~20MB limit on base64 images, warn if approaching
      if (sizeKB > 15000) { // 15MB warning threshold
        console.warn(`Large image size: ${sizeKB}KB - may encounter API limits`);
      }
    } catch (processingError) {
      console.error('Image conversion error:', processingError);
      return NextResponse.json({
        error: 'Failed to process image for analysis',
        code: 'IMAGE_PROCESSING_ERROR',
      }, { status: 500 });
    }

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
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
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

    // Handle image size errors specifically
    if (error instanceof Error && error.message.includes('image dimensions exceed max allowed size')) {
      return NextResponse.json({
        error: 'Image is too large for analysis. Please try with a smaller image.',
        code: 'IMAGE_TOO_LARGE',
      }, { status: 400 });
    }

    // Handle invalid image format errors
    if (error instanceof Error && error.message.includes('invalid_request_error')) {
      return NextResponse.json({
        error: 'Invalid image format. Please ensure the image is a supported format (JPEG, PNG, WebP, GIF).',
        code: 'INVALID_IMAGE_FORMAT',
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to analyse image',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}

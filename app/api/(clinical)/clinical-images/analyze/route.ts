import { Buffer } from 'node:buffer';

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import sharp from 'sharp';

import { checkCoreAccess, extractRBACContext } from '@/src/lib/rbac-enforcer';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent';

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
    const { imageKey, patientSessionId, imageId, prompt, imageData } = await req.json();

    // Validate required fields
    if (!imageKey || !patientSessionId || !imageId) {
      return NextResponse.json({
        error: 'Missing required fields: imageKey, patientSessionId, imageId',
      }, { status: 400 });
    }

    // Validate that the key belongs to an allowed prefix (security check)
    if (!imageKey.startsWith('consultations/') && !imageKey.startsWith('mobile-uploads/') && !imageKey.startsWith('clinical-images/')) {
      return NextResponse.json({ error: 'Invalid image key' }, { status: 400 });
    }

    // Get image buffer - use provided imageData or download from S3
    let buffer: Buffer;

    if (imageData) {
      // Use provided base64 image data (performance optimization)

      try {
        buffer = Buffer.from(imageData, 'base64');

        if (buffer.length === 0) {
          throw new Error('Provided image data is empty');
        }
      } catch (error) {
        console.error('Failed to process provided image data:', error);
        return NextResponse.json({
          error: 'Invalid image data provided',
          code: 'INVALID_IMAGE_DATA',
        }, { status: 400 });
      }
    } else {
      // Fallback: Download image from S3

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
      buffer = Buffer.from(imageBuffer);

      // Validate that we have image data
      if (buffer.length === 0) {
        return NextResponse.json({ error: 'Retrieved image is empty' }, { status: 400 });
      }
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

    const MAX_DIMENSION = 4096; // Reduce to fit safe Claude limits
    let processedImage = image;

    // Check if image needs resizing
    if (metadata.width && metadata.height
      && (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION)) {
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

      processedImage = image.resize(newWidth, newHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to base64 (always as JPEG for consistency)
    let processedBuffer, base64Image;
    try {
      processedBuffer = await processedImage.jpeg({ quality: 85 }).toBuffer();
      base64Image = processedBuffer.toString('base64');

      const sizeKB = Math.round(base64Image.length / 1024);

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
    const systemPrompt = `You are a clinical AI assistant analysing medical images for NZ GPs.

IMPORTANT GUIDELINES:
- This is a clinical documentation aid, not a diagnostic tool
- Focus on objective visual findings only
- Use professional medical terminology appropriate for NZ healthcare
- Keep output brief and concise
- DO NOT include differential diagnoses, "Notable findings", "Recommendations", or "Documentation" sections
- If clinical context is provided by the GP, incorporate this information into your analysis
- DO NOT estimate or mention sizes, measurements, or dimensions unless:
  1. A visual reference (ruler, coin, measuring device) is clearly visible in the image, OR
  2. The GP explicitly provides measurements in their clinical context
- Use descriptive terms like "small", "large", "extensive" without specific measurements when no reference is available

INSTRUCTIONS:
1. State anatomical position (use provided context if available)
2. Provide essential clinical description of what you observe
3. Reference any clinical context provided by the GP in your analysis
4. Describe lesions/findings without speculating about size unless proper references are present
5. Keep to objective bullet points only
6. Always include clinical judgment disclaimer

EXAMPLE OUTPUT FORMAT:
Location: Left forearm
- Small superficial abrasion/excoriation
- Dark brown to purple-coloured debris/crusting present within the wound bed
- Surrounding skin shows mild erythema
- Wound edges are irregular but superficial
- Consistent with GP's observation of recent trauma

IMPORTANT: This analysis is for documentation purposes only. Clinical correlation and professional judgment are required for definitive diagnosis and treatment decisions.`;

    // Call Gemini Vision API (non-streaming) and stream chunks to client
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured', code: 'GEMINI_API_KEY_MISSING' }, { status: 500 });
    }

    // Gemini expects base64 image as inline data part and text prompt
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: systemPrompt },
            {
              text: prompt
                ? `Please provide a concise clinical analysis of this image with objective observations only.\n\nClinical context provided by GP: ${prompt}`
                : 'Please provide a concise clinical analysis of this image with objective observations only.',
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: { temperature: 0.1, maxOutputTokens: 300 },
    };

    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(geminiApiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text().catch(() => '');
      let errMessage = 'Gemini request failed';
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.error?.message) errMessage = parsed.error.message as string;
      } catch {}
      return NextResponse.json({ error: errMessage, code: 'GEMINI_ERROR', details: errText }, { status: 502 });
    }

    const geminiJson = await geminiResponse.json();
    const first = geminiJson?.candidates?.[0];
    const parts = first?.content?.parts ?? first?.content?.[0]?.parts ?? [];
    const text = parts.map((p: any) => (p?.text ?? '')).join('');

    // Stream a simple SSE with one processing ping and final result
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        const initialData = JSON.stringify({ imageId, status: 'processing', description: '' });
        controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));
        const completionData = JSON.stringify({
          imageId,
          status: 'completed',
          description: text,
          metadata: { processingTime: Date.now(), modelUsed: 'gemini-1.5-flash' },
        });
        controller.enqueue(encoder.encode(`data: ${completionData}\n\n`));
        controller.close();
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

    // Handle Anthropic invalid request errors (often schema/mime issues)
    if (error instanceof Error && error.message.includes('invalid_request_error')) {
      return NextResponse.json({
        error: 'Image analysis request was rejected by the AI service. Please retry or try a different image.',
        code: 'ANALYSIS_REQUEST_INVALID',
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to analyse image',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    }, { status: 500 });
  }
}

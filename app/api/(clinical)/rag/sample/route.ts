import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has admin tier
  const userTier = (sessionClaims as any)?.metadata?.tier || 'basic';
  if (userTier !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }

  // Return sample documents for testing
  const sampleDocuments = [
    {
      title: 'Hypertension Management - BPAC',
      content: 'Hypertension is a major risk factor for cardiovascular disease in New Zealand. Blood pressure targets for most adults should be <140/90 mmHg. For high-risk patients including those with diabetes or existing cardiovascular disease, targets should be <130/80 mmHg. First-line treatment includes ACE inhibitors, calcium channel blockers, and thiazide diuretics. Regular monitoring and lifestyle modifications are essential.',
      source: 'https://bpac.org.nz/hypertension',
      sourceType: 'bpac',
    },
    {
      title: 'Diabetes Type 2 Guidelines - MoH',
      content: 'Type 2 diabetes management in New Zealand follows a stepped approach. HbA1c targets are generally <53 mmol/mol (7%) for most adults. Metformin is the first-line treatment unless contraindicated. Regular screening for complications including retinopathy, nephropathy, and neuropathy is essential. Lifestyle interventions including diet and exercise remain fundamental.',
      source: 'https://www.health.govt.nz/diabetes-guidelines',
      sourceType: 'moh',
    },
    {
      title: 'Cardiovascular Risk Assessment - BPAC',
      content: 'Cardiovascular risk assessment in New Zealand uses the PREDICT cardiovascular risk calculator. This tool estimates 5-year cardiovascular disease risk for New Zealand adults. Risk factors include age, sex, ethnicity, diabetes, smoking, blood pressure, and cholesterol. High-risk patients (>15% 5-year risk) should receive intensive risk factor modification including statin therapy.',
      source: 'https://bpac.org.nz/cardiovascular-risk',
      sourceType: 'bpac',
    },
  ];

  return Response.json({
    message: 'Sample documents for RAG testing',
    documents: sampleDocuments,
    usage: {
      endpoint: 'POST /api/rag/admin/ingest',
      body: { documents: sampleDocuments },
      description: 'Use these sample documents to test the RAG ingestion process',
    },
  });
}

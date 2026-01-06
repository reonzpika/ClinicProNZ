/**
 * GET /api/medtech/capabilities
 *
 * Returns feature flags and coded value lists
 */

import { NextResponse } from 'next/server';

import type { Capabilities } from '@/src/medtech/images-widget/types';

export async function GET() {
  try {
    // Mock capabilities (server-side safe)
    const capabilities: Capabilities = {
      provider: {
        name: 'alex',
        environment: 'mock',
      },
      features: {
        images: {
          enabled: true,
          mobileHandoff: {
            qr: true,
            ttlSeconds: 600,
          },
          inbox: {
            enabled: true,
          },
          tasks: {
            enabled: true,
          },
          quickChips: {
            laterality: [
              { system: 'http://snomed.info/sct', code: '7771000', display: 'Left' },
              { system: 'http://snomed.info/sct', code: '24028007', display: 'Right' },
            ],
            bodySitesCommon: [
              { system: 'http://snomed.info/sct', code: '89545001', display: 'Face' },
              { system: 'http://snomed.info/sct', code: '43799004', display: 'Scalp' },
              { system: 'http://snomed.info/sct', code: '22943007', display: 'Trunk' },
              { system: 'http://snomed.info/sct', code: '53120007', display: 'Upper limb' },
              { system: 'http://snomed.info/sct', code: '40983000', display: 'Forearm' },
              { system: 'http://snomed.info/sct', code: '7569003', display: 'Hand' },
              { system: 'http://snomed.info/sct', code: '61685007', display: 'Lower limb' },
              { system: 'http://snomed.info/sct', code: '30021000', display: 'Leg' },
              { system: 'http://snomed.info/sct', code: '56459004', display: 'Foot' },
            ],
            views: [
              { system: 'clinicpro/view', code: 'close-up', display: 'Close-up' },
              { system: 'clinicpro/view', code: 'dermoscopy', display: 'Dermoscopy' },
              { system: 'clinicpro/view', code: 'other', display: 'Other' },
            ],
            types: [
              { system: 'clinicpro/type', code: 'lesion', display: 'Lesion' },
              { system: 'clinicpro/type', code: 'rash', display: 'Rash' },
              { system: 'clinicpro/type', code: 'wound', display: 'Wound' },
              { system: 'clinicpro/type', code: 'infection', display: 'Infection' },
              { system: 'clinicpro/type', code: 'other', display: 'Other' },
            ],
          },
        },
      },
      limits: {
        attachments: {
          acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
          maxSizeBytes: 1048576, // 1MB
          maxPerRequest: 10,
          maxTotalBytesPerEncounter: 52428800, // 50MB
        },
      },
      recipients: {
        inbox: [
          { id: 'mock-gp-1', type: 'user', display: 'Dr Mock Smith' },
          { id: 'mock-gp-2', type: 'user', display: 'Dr Mock Jones' },
          { id: 'mock-team-1', type: 'team', display: 'Triage Inbox' },
        ],
        tasks: [
          { id: 'mock-nurse-1', type: 'user', display: 'Nurse Mock Lee' },
          { id: 'mock-nurse-2', type: 'user', display: 'Nurse Mock Chen' },
        ],
      },
    };

    return NextResponse.json(capabilities);
  } catch (error) {
    console.error('[API] GET /api/medtech/capabilities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch capabilities' },
      { status: 500 },
    );
  }
}

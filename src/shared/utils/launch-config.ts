/**
 * Launch Configuration
 *
 * This file contains feature flags and configuration for the ClinicPro launch.
 * These flags control which features are available in production.
 */

export const LAUNCH_CONFIG = {
  // Core Features - Always enabled
  CONSULTATION_SUITE: true,
  VOICE_TRANSCRIPTION: true,
  AI_CLINICAL_NOTES: true,

  // Template System
  TEMPLATE_MANAGEMENT: true,
  TEMPLATE_SHARING: false, // Coming soon

  // Advanced Features
  CLINICAL_IMAGES: true,
  DIFFERENTIAL_DIAGNOSIS: true,
  CLINICAL_CHECKLISTS: true,

  // Mobile Features
  MOBILE_RECORDING: true,
  QR_CODE_SESSIONS: true,

  // Business Features
  BILLING_SYSTEM: true,
  SUBSCRIPTION_MANAGEMENT: true,
  USAGE_TRACKING: true,

  // Admin Features
  ADMIN_DASHBOARD: true,
  TIER_TESTING: true,
  SYSTEM_MONITORING: true,

  // Integration Features
  RAG_SYSTEM: true,
  ABLY_REALTIME: true,
  STRIPE_PAYMENTS: true,

  // Future Features (disabled)
  TEAM_COLLABORATION: false,
  PATIENT_PORTALS: false,
  APPOINTMENT_BOOKING: false,
  PRESCRIPTION_MANAGEMENT: false,
} as const;

/**
 * @deprecated Use tier-based checks from billing-config.ts instead
 * Feature access is now determined by user tiers, not global flags
 */
export const LEGACY_FEATURE_FLAGS = {
  // Legacy feature flags - use tier-based access control instead
  PREMIUM_FEATURES: true, // Now controlled by tier (premium/admin)
  STANDARD_FEATURES: true, // Now controlled by tier (standard+)
  BASIC_FEATURES: true, // Now controlled by tier (basic+)
} as const;

/**
 * Get feature availability based on launch config
 */
export function isFeatureEnabled(feature: keyof typeof LAUNCH_CONFIG): boolean {
  return LAUNCH_CONFIG[feature];
}

/**
 * Launch readiness checks
 */
export const LAUNCH_READINESS = {
  AUTHENTICATION: true, // Clerk integration complete
  BILLING: true, // Stripe integration complete
  RBAC: true, // Tier-based access control implemented
  MOBILE: true, // Mobile recording ready
  AI_FEATURES: true, // OpenAI integration stable
  DATABASE: true, // PostgreSQL schema complete
  DEPLOYMENT: true, // Vercel deployment ready
} as const;

/**
 * Check if the application is ready for launch
 */
export function isLaunchReady(): boolean {
  return Object.values(LAUNCH_READINESS).every(Boolean);
}

/**
 * Launch phases - used for gradual rollout
 */
export const LAUNCH_PHASES = {
  ALPHA: 'alpha', // Internal testing
  BETA: 'beta', // Limited user testing
  PRODUCTION: 'production', // Full public launch
} as const;

/**
 * Current launch phase
 */
export const CURRENT_PHASE = LAUNCH_PHASES.PRODUCTION;

/**
 * Phase-based feature availability
 */
export function isFeatureAvailableInPhase(feature: keyof typeof LAUNCH_CONFIG): boolean {
  const featureEnabled = isFeatureEnabled(feature);

  // All features available in production
  if (CURRENT_PHASE === LAUNCH_PHASES.PRODUCTION) {
    return featureEnabled;
  }

  // Limited features in beta
  if (CURRENT_PHASE === LAUNCH_PHASES.BETA) {
    const betaFeatures: (keyof typeof LAUNCH_CONFIG)[] = [
      'CONSULTATION_SUITE',
      'VOICE_TRANSCRIPTION',
      'AI_CLINICAL_NOTES',
      'TEMPLATE_MANAGEMENT',
      'MOBILE_RECORDING',
      'BILLING_SYSTEM',
    ];
    return betaFeatures.includes(feature) && featureEnabled;
  }

  // Core features only in alpha
  if (CURRENT_PHASE === LAUNCH_PHASES.ALPHA) {
    const alphaFeatures: (keyof typeof LAUNCH_CONFIG)[] = [
      'CONSULTATION_SUITE',
      'VOICE_TRANSCRIPTION',
      'AI_CLINICAL_NOTES',
    ];
    return alphaFeatures.includes(feature) && featureEnabled;
  }

  return false;
}

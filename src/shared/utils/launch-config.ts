// Launch Configuration for ClinicPro
// Set NEXT_PUBLIC_LAUNCH_DATE="2025-07-07T00:00:00+12:00" in your environment variables

export const LAUNCH_CONFIG = {
  // July 7, 2025 at midnight NZ time (NZST)
  launchDate: new Date(process.env.NEXT_PUBLIC_LAUNCH_DATE || '2025-07-07T00:00:00+12:00'),

  // Early access limits
  first30Limit: 30,
  earlyAdopterLimit: 100,

  // Historical pricing reference (now managed in billing-config.ts)
  pricing: {
    first30: 30,
    earlyAdopter: 49,
    standard: 89,
  },

  // UI display flags (not feature access)
  showCountdown: true,
  enableFirst30Signup: true,
  enableEarlyAdopterSignup: true,
} as const;

/**
 * @deprecated Use role-based checks from billing-config.ts instead
 * Feature access is now determined by user roles, not global flags
 */

export const getLaunchDate = (): Date => {
  return LAUNCH_CONFIG.launchDate;
};

export const isLaunchDatePassed = (): boolean => {
  return new Date() > LAUNCH_CONFIG.launchDate;
};

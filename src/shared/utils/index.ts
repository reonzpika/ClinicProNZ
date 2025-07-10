// Role-based access control utilities
export type { UserRole } from './roles';
export * from './roles';

// Re-export common role guards for convenience
export {
  checkRole,
  getCurrentRole,
  getUserRoleInfo,
  hasRole,
  requireRole,
  RoleGuards,
} from './roles';

// Billing and plan utilities
export * from './billing-config';
export {
  BILLING_CONFIG,
  getPlanByRole,
  getRoleByStripePriceId,
} from './billing-config';

// RBAC utilities
export {
  canAccessTemplates,
  getTierFromRole,
} from '../../lib/rbac-enforcer';

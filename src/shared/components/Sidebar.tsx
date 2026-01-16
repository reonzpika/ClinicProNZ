'use client';

import { SignInButton, SignUpButton, useAuth, UserButton } from '@clerk/nextjs';
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  Search,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useRBAC } from '@/src/shared/hooks/useRBAC';

type SidebarProps = {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isDesktop?: boolean;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  requiresAuth?: boolean;
  adminOnly?: boolean;
};

const mainNavItems: NavItem[] = [
  { href: '/ai-scribe/consultation', label: 'Clinical Notes', icon: Stethoscope },
  { href: '/ai-scribe/templates', label: 'Note Templates', icon: FileText, requiresAuth: true },
  { href: '/image/app', label: 'Clinical Images', icon: Camera, requiresAuth: true },
  { href: '/acc/occupation-codes', label: 'ACC Occupation Codes', icon: Search },
  { href: '/acc/employer-lookup', label: 'Employer Lookup', icon: Search },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck, requiresAuth: true },
];

const infoNavItems: NavItem[] = [];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
  isDesktop = true,
}) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: _user } = useClerkMetadata();
  const { hasFeatureAccess } = useRBAC();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Use production tier detection for real features (not testing)
  const { getUserTier } = useClerkMetadata();
  const userTier = getUserTier();
  const isAdmin = userTier === 'admin';

  const handleNavClick = (item: NavItem, e: React.MouseEvent) => {
    if (item.requiresAuth && !isSignedIn) {
      e.preventDefault();
      setShowAuthModal(true);
    } else if (item.adminOnly && !isAdmin) {
      e.preventDefault();
      // Silently ignore click for admin-only items
    } else {
      router.push(item.href);
      // Close mobile sidebar after navigation
      if (!isDesktop && onMobileClose) {
        onMobileClose();
      }
    }
  };

  const NavButton: React.FC<{ item: NavItem }> = ({ item }) => {
    const Icon = item.icon;

    return (
      <button
        type="button"
        onClick={e => handleNavClick(item, e)}
        className={`
          flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800
          ${isCollapsed ? 'justify-center' : ''}
        `}
        title={isCollapsed ? item.label : undefined}
      >
        <Icon size={18} className="shrink-0" />
        {!isCollapsed && <span>{item.label}</span>}
      </button>
    );
  };

  return (
    <>
      <div className={`
        fixed left-0 top-0 h-full border-r border-slate-200 bg-white transition-all duration-300 ease-in-out
        ${isDesktop
      ? `z-40 ${isCollapsed ? 'w-16' : 'w-64'}`
      : `z-50 w-64 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`
    }
      `}
      >
        {/* Logo and Toggle Button */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-3">
          {!isCollapsed && (
            <Link href="/" className="text-lg font-semibold text-slate-700">
              ClinicPro for GP
            </Link>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            title={isCollapsed ? 'ClinicPro for GP - Expand Menu' : 'Collapse Menu'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex h-[calc(100vh-4rem)] flex-col">
          {/* Main Navigation */}
          <div className="flex-none p-3">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Main
              </h3>
            )}
            <div className="space-y-1">
              {mainNavItems
                .filter((item) => {
                  // Filter out admin-only items for non-admin users
                  if (item.adminOnly && !isAdmin) {
                    return false;
                  }

                  // Filter out templates for users without template management access (public + basic tier)
                  if (item.href === '/ai-scribe/templates') {
                    // Hide for public users
                    if (!isSignedIn) {
                      return false;
                    }
                    // Hide for signed-in basic tier users
                    if (!hasFeatureAccess('templateManagement')) {
                      return false;
                    }
                  }

                  return true;
                })
                .map(item => (
                  <NavButton key={item.href} item={item} />
                ))}
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Admin Section (for admin users only) */}
          {isSignedIn && isAdmin && (
            <div className="flex-none p-3">
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Admin
                </h3>
              )}
              <div className="space-y-1">
                {adminNavItems.map(item => (
                  <NavButton key={item.href} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="flex-none p-3">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Information
              </h3>
            )}
            <div className="space-y-1">
              {infoNavItems.map(item => (
                <NavButton key={item.href} item={item} />
              ))}
            </div>
          </div>

          {/* User Section */}
          <div className="flex-none border-t border-slate-200 p-3">
            {!isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </h3>
            )}
            <div className="space-y-1">
              {/* Auth Section */}
              {isSignedIn
                ? (
                    <div className={`
                  flex items-center gap-3 rounded-lg px-3 py-2
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                    >
                      <UserButton afterSignOutUrl="/" />
                      {!isCollapsed && <span className="text-sm text-slate-600">Account</span>}
                    </div>
                  )
                : (
                    <div className="space-y-1">
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          disabled={!isLoaded}
                          className={`
                      flex w-full items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50
                      ${isCollapsed ? 'justify-center' : ''}
                      ${!isLoaded ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                          title={isCollapsed ? 'Sign In' : undefined}
                        >
                          {!isCollapsed && <span>Sign In</span>}
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button
                          type="button"
                          disabled={!isLoaded}
                          className={`
                      flex w-full items-center gap-3 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white transition-colors hover:bg-slate-800
                      ${isCollapsed ? 'justify-center' : ''}
                      ${!isLoaded ? 'cursor-not-allowed opacity-50' : ''}
                    `}
                          title={isCollapsed ? 'Sign Up' : undefined}
                        >
                          {!isCollapsed && <span>Sign Up</span>}
                        </button>
                      </SignUpButton>
                    </div>
                  )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-center text-sm font-semibold text-slate-900">
              You need to sign in or sign up to access this feature.
            </h2>
            <div className="flex justify-center gap-3">
              <SignInButton mode="modal">
                <button className="rounded-md border border-slate-400 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-md bg-slate-700 px-3 py-1 text-sm text-white hover:bg-slate-800">
                  Sign Up
                </button>
              </SignUpButton>
              <button
                className="rounded-md border border-slate-300 px-3 py-1 text-sm"
                onClick={() => setShowAuthModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

'use client';

import { SignInButton, SignUpButton, useAuth, UserButton, useUser } from '@clerk/nextjs';
import {
  Bell,
  Book,
  Brain,
  Camera,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  Info,
  MessageSquare,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { FeedbackModal } from '@/features/roadmap/components/FeedbackModal';
import { submitFeatureRequest } from '@/features/roadmap/roadmap-service';
import { useRBAC } from '@/shared/hooks/useRBAC';

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
  { href: '/consultation', label: 'Clinical Notes', icon: Stethoscope },
  { href: '/templates', label: 'Note Templates', icon: FileText, requiresAuth: true },
  { href: '/clinical-reference', label: 'Clinical Reference', icon: Book, adminOnly: true },
  { href: '/differential-diagnosis', label: 'Differential Diagnosis', icon: Brain, adminOnly: true },
  { href: '/clinical-image', label: 'Clinical Images', icon: Camera, adminOnly: true },
];

const accountNavItems: NavItem[] = [
  { href: '/settings', label: 'Settings', icon: Settings, requiresAuth: true },
  { href: '/billing', label: 'Billing', icon: CreditCard, requiresAuth: true },
];

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Admin Panel', icon: ShieldCheck, requiresAuth: true },
];

const infoNavItems: NavItem[] = [
  { href: '/landing-page', label: 'Digital Scribing', icon: Sparkles },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
  { href: '/about', label: 'About', icon: Info },
  { href: '/roadmap', label: 'Updates', icon: Bell },
  { href: '/privacy-info', label: 'Privacy', icon: Shield },
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
  isDesktop = true,
}) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { hasFeatureAccess } = useRBAC();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Feedback modal state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | undefined>();
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Get user role for admin access
  const userRole = user?.publicMetadata?.role as string;
  const isAdmin = userRole === 'admin';

  const handleFeedback = async (data: { idea: string; details?: string; email?: string }) => {
    setFeedbackLoading(true);
    setFeedbackError(undefined);
    setFeedbackSuccess(false);
    const res = await submitFeatureRequest(data);
    if (res.success) {
      setFeedbackSuccess(true);
      setTimeout(() => setFeedbackModalOpen(false), 1200);
    } else {
      setFeedbackError(res.message || 'Something went wrong');
    }
    setFeedbackLoading(false);
  };

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
                .filter(item => {
                  // Filter out admin-only items for non-admin users
                  if (item.adminOnly && !isAdmin) return false;
                  
                  // Filter out templates for users without template management access (public + basic tier)
                  if (item.href === '/templates') {
                    // Hide for public users
                    if (!isSignedIn) return false;
                    // Hide for signed-in basic tier users
                    if (!hasFeatureAccess('templateManagement')) return false;
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

          {/* Account Section (for authenticated users) */}
          {isSignedIn && (
            <div className="flex-none p-3">
              {!isCollapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Account
                </h3>
              )}
              <div className="space-y-1">
                {accountNavItems.map(item => (
                  <NavButton key={item.href} item={item} />
                ))}
              </div>
            </div>
          )}

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
              {/* Feedback Button */}
              <button
                onClick={() => {
                  setFeedbackModalOpen(true);
                  setFeedbackSuccess(false);
                  setFeedbackError(undefined);
                }}
                className={`
                  flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={isCollapsed ? 'Feedback' : undefined}
              >
                <MessageSquare size={18} className="shrink-0" />
                {!isCollapsed && <span>Feedback</span>}
              </button>

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
                          className={`
                      flex w-full items-center gap-3 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                          title={isCollapsed ? 'Sign In' : undefined}
                        >
                          {!isCollapsed && <span>Sign In</span>}
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <button
                          className={`
                      flex w-full items-center gap-3 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white transition-colors hover:bg-slate-800
                      ${isCollapsed ? 'justify-center' : ''}
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
              You need to sign in or sign up to access note templates.
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

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onSubmit={handleFeedback}
        loading={feedbackLoading}
        error={feedbackError}
        success={feedbackSuccess}
      />
    </>
  );
};

// @ts-nocheck
// @ts-nocheck
'use client';

import { Camera, FileText } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { ClinicalImageTab } from './ClinicalImageTab';
import { ReferralLetterTab } from './ReferralLetterTab';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';

type TabId = 'images' | 'referral';

type ClinicalToolsTabsProps = {
  fixedHeightClass?: string;
};

export const ClinicalToolsTabs: React.FC<ClinicalToolsTabsProps> = ({ fixedHeightClass = 'h-[400px]' }) => {
  const [activeTab, setActiveTab] = useState<TabId>('images');
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // default collapsed
  const { getUserTier } = useClerkMetadata();
  const isAdmin = getUserTier() === 'admin';
  const { generatedNotes } = useConsultationStores();
  
  // Check if consultation note exists for referral tab
  const hasConsultationNote = generatedNotes && generatedNotes.trim() !== '';

  const tabs = useMemo(() => {
    const allTabs = [
      { id: 'images' as const, icon: Camera, title: 'Clinical Images' },
    ];
    
    // Only show referral tab after consultation note is generated
    if (hasConsultationNote) {
      allTabs.push({ id: 'referral' as const, icon: FileText, title: 'Referral Letter' });
    }
    
    return allTabs;
  }, [hasConsultationNote]);

  // Ensure active tab remains valid when admin status changes
  useEffect(() => {
    const available = tabs.map(t => t.id);
    if (!available.includes(activeTab)) {
      setActiveTab('images');
      setIsExpanded(false);
    }
  }, [tabs, activeTab]);

  const handleClick = (id: TabId) => {
    if (id === activeTab) {
      setIsExpanded(!isExpanded);
    } else {
      setActiveTab(id);
      setIsExpanded(true);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Icon-only tab strip */}
      <div className="mb-2 flex items-center gap-2">
        {tabs.map(({ id, icon: Icon, title }) => {
          const isActive = id === activeTab;
          const activeColor = isActive ? 'text-blue-600' : 'text-slate-600';
          const activeBg = isActive && isExpanded ? 'bg-blue-100' : 'hover:bg-slate-100';
          return (
            <button
              key={id}
              onClick={() => handleClick(id)}
              title={title}
              className={`flex size-9 items-center justify-center rounded-md border border-slate-200 ${activeBg} ${activeColor} transition-colors`}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Content area (always mounted, visibility controlled) */}
      <div className={`${fixedHeightClass} overflow-hidden`}> {/* fixed panel height */}
        {/* Clinical Images */}
        <div className={`${activeTab === 'images' && isExpanded ? 'block' : 'hidden'} h-full overflow-y-auto pr-1`}>
          <ClinicalImageTab />
        </div>

        {/* Referral Letter */}
        <div className={`${activeTab === 'referral' && isExpanded ? 'block' : 'hidden'} h-full overflow-y-auto pr-1`}>
          <ReferralLetterTab />
        </div>

        {/* Legacy widgets (Checklist, DDx, ACC) removed */}
      </div>
    </div>
  );
};

export default ClinicalToolsTabs;


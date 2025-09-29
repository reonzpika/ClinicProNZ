// @ts-nocheck
// @ts-nocheck
'use client';

import { Camera, CheckSquare, MessageCircle, Search, Stethoscope } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { ChatbotWidget } from './ChatbotWidget';
import { ClinicalImageTab } from './ClinicalImageTab';
import { ChecklistTab } from './ChecklistTab';
import { DifferentialDiagnosisTab } from './DifferentialDiagnosisTab';
import { AccCodeSuggestions } from './AccCodeSuggestions';
import { PatientAdviceTab } from './PatientAdviceTab';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';

type TabId = 'chat' | 'images' | 'checklist' | 'ddx' | 'acc' | 'advice';

type ClinicalToolsTabsProps = {
  fixedHeightClass?: string;
};

export const ClinicalToolsTabs: React.FC<ClinicalToolsTabsProps> = ({ fixedHeightClass = 'h-[400px]' }) => {
  const [activeTab, setActiveTab] = useState<TabId>('chat');
  const [isExpanded, setIsExpanded] = useState<boolean>(false); // default collapsed
  const { getUserTier } = useClerkMetadata();
  const isAdmin = getUserTier() === 'admin';

  const tabs = useMemo(() => ([
    { id: 'chat' as const, icon: MessageCircle, title: 'Chat' },
    { id: 'images' as const, icon: Camera, title: 'Clinical Images' },
    ...(isAdmin ? [{ id: 'checklist' as const, icon: CheckSquare, title: 'Checklist' }] : []),
    ...(isAdmin ? [{ id: 'ddx' as const, icon: Search, title: 'Differential Diagnosis' }] : []),
    { id: 'advice' as const, icon: Search, title: 'Patient Advice' },
    ...(isAdmin ? [{ id: 'acc' as const, icon: Stethoscope, title: 'ACC Codes' }] : []),
  ]), [isAdmin]);

  // Ensure active tab remains valid when admin status changes
  useEffect(() => {
    const available = tabs.map(t => t.id);
    if (!available.includes(activeTab)) {
      setActiveTab('chat');
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
        {/* Chat */}
        <div className={`${activeTab === 'chat' && isExpanded ? 'block' : 'hidden'} h-full`}>
          <ChatbotWidget embedded defaultCollapsed={false} fixedHeightClass="h-full" />
        </div>

        {/* Clinical Images */}
        <div className={`${activeTab === 'images' && isExpanded ? 'block' : 'hidden'} h-full overflow-y-auto pr-1`}>
          <ClinicalImageTab />
        </div>

        {/* Checklist */}
        <div className={`${activeTab === 'checklist' && isExpanded ? 'block' : 'hidden'} h-full overflow-y-auto pr-1`}>
          <ChecklistTab />
        </div>

        {/* Differential Diagnosis */}
        <div className={`${activeTab === 'ddx' && isExpanded ? 'block' : 'hidden'} h-full overflow-y-auto pr-1`}>
          <DifferentialDiagnosisTab />
        </div>

        {/* Patient Advice */}
        <div className={`${activeTab === 'advice' && isExpanded ? 'block' : 'hidden'} h-full overflow-y-auto pr-1`}>
          <PatientAdviceTab />
        </div>

        {/* ACC Codes */}
        <div className={`${activeTab === 'acc' && isExpanded ? 'block' : 'hidden'} h-full overflow-y-auto pr-1`}>
          <AccCodeSuggestions />
        </div>
      </div>
    </div>
  );
};

export default ClinicalToolsTabs;


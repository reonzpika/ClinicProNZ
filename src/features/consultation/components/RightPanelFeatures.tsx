'use client';

import { Camera, CheckSquare, MessageCircle, Search, Stethoscope } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/shared/components/ui/button';

import { AccCodeSuggestions } from './AccCodeSuggestions';
import { ChatbotWidget } from './ChatbotWidget';
import { ChecklistTab } from './tabs/ChecklistTab';
import { DifferentialDiagnosisTab } from './tabs/DifferentialDiagnosisTab';
import { MobileTab } from './tabs/MobileTab';

type SectionId = 'mobile' | 'checklist' | 'ddx' | 'chat' | 'acc';

type AccordionSection = {
  id: SectionId;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  component: React.ComponentType;
};

const sections: AccordionSection[] = [
  { id: 'mobile', icon: Camera, title: 'QR Camera Upload', component: MobileTab },
  { id: 'checklist', icon: CheckSquare, title: 'Interactive Checklist', component: ChecklistTab },
  { id: 'ddx', icon: Search, title: 'Differential Diagnosis', component: DifferentialDiagnosisTab },
  { id: 'chat', icon: MessageCircle, title: 'Clinical Reference', component: ChatbotWidget },
  { id: 'acc', icon: Stethoscope, title: 'ACC Code Suggestions', component: AccCodeSuggestions },
];

const RightPanelFeatures: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SectionId>('mobile');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentSection = sections.find(section => section.id === activeSection);
  const CurrentComponent = currentSection?.component || MobileTab;

  if (isCollapsed) {
    return (
      <div className="flex w-12 flex-col border-l border-slate-200 bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="m-2 h-6 w-8 p-0 text-slate-600 hover:text-slate-800"
        >
          ❮
        </Button>
        <div className="flex flex-col space-y-2 p-2">
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setIsCollapsed(false)}
              className="flex size-8 items-center justify-center rounded text-slate-600 hover:bg-slate-100"
              title={section.title}
            >
              <section.icon size={16} />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full border-l border-slate-200 bg-white">
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <h3 className="text-sm font-medium text-slate-700">
            {currentSection?.title || 'Clinical Tools'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
            className="size-6 p-0 text-slate-600 hover:text-slate-800"
          >
            ❯
          </Button>
        </div>

        {/* Tool Content */}
        <div className="flex-1 overflow-y-auto p-3">
          <CurrentComponent />
        </div>
      </div>

      {/* Permanent Icon Sidebar */}
      <div className="w-12 border-l border-slate-100 bg-slate-50">
        <div className="flex flex-col p-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex size-10 items-center justify-center rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title={section.title}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RightPanelFeatures;

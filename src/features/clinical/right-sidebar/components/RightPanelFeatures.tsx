'use client';

import { Camera, CheckSquare, MessageCircle, Search, Stethoscope } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { useRBAC } from '@/src/shared/hooks/useRBAC';

import { ChatbotWidget } from './ChatbotWidget';
import { ClinicalImageTab } from './ClinicalImageTab';
import { ComingSoonPlaceholder } from './ComingSoonPlaceholder';

type SectionId = 'images' | 'checklist' | 'ddx' | 'chat' | 'acc';

type AccordionSection = {
  id: SectionId;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  component: React.ComponentType;
};

const sections: AccordionSection[] = [
  {
    id: 'images',
    icon: Camera,
    title: 'Clinical Images',
    description: 'Upload and analyze medical images with AI-powered insights and diagnostic assistance',
    component: () => <ComingSoonPlaceholder title="Clinical Images" description="Upload and analyze medical images with AI-powered insights and diagnostic assistance" icon={Camera} />,
  },
  {
    id: 'checklist',
    icon: CheckSquare,
    title: 'Interactive Checklist',
    description: 'Smart clinical checklists that adapt to your workflow and patient presentations',
    component: () => <ComingSoonPlaceholder title="Interactive Checklist" description="Smart clinical checklists that adapt to your workflow and patient presentations" icon={CheckSquare} />,
  },
  {
    id: 'ddx',
    icon: Search,
    title: 'Differential Diagnosis',
    description: 'AI-powered differential diagnosis suggestions based on clinical presentation and symptoms',
    component: () => <ComingSoonPlaceholder title="Differential Diagnosis" description="AI-powered differential diagnosis suggestions based on clinical presentation and symptoms" icon={Search} />,
  },
  {
    id: 'chat',
    icon: MessageCircle,
    title: 'Clinical Reference',
    description: 'Ask questions about clinical guidelines, medications, and best practices',
    component: () => <ComingSoonPlaceholder title="Clinical Reference" description="Ask questions about clinical guidelines, medications, and best practices" icon={MessageCircle} />,
  },
  {
    id: 'acc',
    icon: Stethoscope,
    title: 'ACC Code Suggestions',
    description: 'Intelligent ACC code suggestions based on your consultation notes and patient presentation',
    component: () => <ComingSoonPlaceholder title="ACC Code Suggestions" description="Intelligent ACC code suggestions based on your consultation notes and patient presentation" icon={Stethoscope} />,
  },
];

type RightPanelFeaturesProps = {
  isCollapsed?: boolean;
  onToggle?: () => void;
};

const RightPanelFeatures: React.FC<RightPanelFeaturesProps> = ({
  isCollapsed = true,
  onToggle,
}) => {
  const [activeSection, setActiveSection] = useState<SectionId>('images');
  const { isAdmin } = useRBAC();

  // Update sections with conditional components based on user tier
  const sectionsWithConditionalFeatures: AccordionSection[] = sections.map((section) => {
    if (section.id === 'chat') {
      return {
        ...section,
        component: () => <ChatbotWidget />, // RBAC legacy removed - all users have access
      };
    }
    if (section.id === 'images') {
      return {
        ...section,
        component: () => <ClinicalImageTab />, // RBAC legacy removed - all users have access
      };
    }
    return section;
  });

  const currentSection = sectionsWithConditionalFeatures.find(section => section.id === activeSection);
  const CurrentComponent = currentSection?.component || (() => <ComingSoonPlaceholder title="Clinical Tools" description="Advanced clinical tools to enhance your consultation workflow" icon={Camera} />);

  if (isCollapsed) {
    return (
      <div className="flex w-12 flex-col border-l border-slate-200 bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="m-2 h-6 w-8 p-0 text-slate-600 hover:text-slate-800"
        >
          ❮
        </Button>
        <div className="flex flex-col space-y-2 p-2">
          {sectionsWithConditionalFeatures.map(section => (
            <button
              key={section.id}
              onClick={onToggle}
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
            onClick={onToggle}
            className="size-6 p-0 text-slate-600 hover:text-slate-800"
          >
            ❯
          </Button>
        </div>

        {/* Tool Content */}
        <div className="flex-1 overflow-y-auto">
          <CurrentComponent />
        </div>
      </div>

      {/* Permanent Icon Sidebar */}
      <div className="w-12 border-l border-slate-100 bg-slate-50">
        <div className="flex flex-col p-1">
          {sectionsWithConditionalFeatures.map((section) => {
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

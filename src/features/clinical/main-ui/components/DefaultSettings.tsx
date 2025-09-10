'use client';

import { useAuth } from '@clerk/nextjs';
import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import type { Template } from '@/src/features/templates/types';
import { fetchTemplates } from '@/src/features/templates/utils/api';
import { useConsultationStores } from '@/src/hooks/useConsultationStores';
import { Button } from '@/src/shared/components/ui/button';
import { Card } from '@/src/shared/components/ui/card';
import { useClerkMetadata } from '@/src/shared/hooks/useClerkMetadata';
import { type DefaultInputMode, type RecordingMethod, useUserSettingsStore } from '@/src/stores/userSettingsStore';

const DEFAULT_TEMPLATE_ID = '20dc1526-62cc-4ff4-a370-ffc1ded52aef';

export function DefaultSettings() {
  const { isSignedIn } = useAuth();
  const { getUserTier, user } = useClerkMetadata();
  const userTier = getUserTier();
  const userId = user?.id;

  const { setTemplateId, setInputMode } = useConsultationStores();
  const { settings, loadSettings, updateSettings } = useUserSettingsStore();

  const [templates, setTemplates] = useState<Template[]>([]);
  const favouriteTemplateId = settings?.favouriteTemplateId || DEFAULT_TEMPLATE_ID;
  const defaultInputMode: DefaultInputMode = (settings?.defaultInputMode as DefaultInputMode) || 'audio';
  const defaultRecordingMethod: RecordingMethod = (settings?.defaultRecordingMethod as RecordingMethod) || 'desktop';
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }
    loadSettings(userId, userTier);
  }, [isSignedIn, loadSettings, userId, userTier]);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchTemplates(userId, userTier);
        setTemplates(list);
      } catch {
        setTemplates([]);
      }
    })();
  }, [userId, userTier]);

  const orderedTemplates = useMemo(() => {
    if (!templates || !Array.isArray(templates)) {
      return [] as Template[];
    }
    const order = settings?.templateOrder || [];
    if (!order.length) {
      return templates;
    }
    const map = new Map<string, Template>(templates.map(t => [t.id, t]));
    const ordered = order.map(id => map.get(id)).filter(Boolean) as Template[];
    const remaining = templates.filter(t => !order.includes(t.id));
    return [...ordered, ...remaining];
  }, [templates, settings?.templateOrder]);

  const onTemplateChange = async (id: string) => {
    await updateSettings({ favouriteTemplateId: id }, userId, userTier);
    setTemplateId(id);
  };

  const onInputModeChange = async (mode: DefaultInputMode) => {
    await updateSettings({ defaultInputMode: mode }, userId, userTier);
    setInputMode(mode);
  };

  const onRecordingMethodChange = async (method: RecordingMethod) => {
    await updateSettings({ defaultRecordingMethod: method }, userId, userTier);
  };

  return (
    <Card
      className="space-y-3 p-3"
      onClick={() => {
        if (collapsed) setCollapsed(false);
      }}
      role="region"
      aria-label="Default settings"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
        aria-expanded={!collapsed}
      >
        <div className="text-sm font-medium text-slate-700">Default settings</div>
        {collapsed ? (
          <ChevronDown className="size-4 text-slate-600" />
        ) : (
          <ChevronUp className="size-4 text-slate-600" />
        )}
      </button>

      {!collapsed && (
        <>
      <div className="space-y-1">
        <div className="text-xs text-slate-500">Default template</div>
        <select
          className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm"
          value={favouriteTemplateId}
          onChange={e => onTemplateChange(e.target.value)}
        >
          {orderedTemplates.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-slate-500">Default input</div>
        <div className="inline-flex rounded-md border border-slate-300 bg-white p-1 text-sm">
          <Button
            type="button"
            variant={defaultInputMode === 'audio' ? 'default' : 'ghost'}
            className={`h-8 px-3 ${defaultInputMode === 'audio' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-700'}`}
            onClick={() => onInputModeChange('audio')}
          >
            Audio
          </Button>
          <Button
            type="button"
            variant={defaultInputMode === 'typed' ? 'default' : 'ghost'}
            className={`h-8 px-3 ${defaultInputMode === 'typed' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-700'}`}
            onClick={() => onInputModeChange('typed')}
          >
            Typed
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs text-slate-500">Default recording method</div>
        <div className="inline-flex rounded-md border border-slate-300 bg-white p-1 text-sm">
          <Button
            type="button"
            variant={defaultRecordingMethod === 'desktop' ? 'default' : 'ghost'}
            className={`h-8 px-3 ${defaultRecordingMethod === 'desktop' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-700'}`}
            onClick={() => onRecordingMethodChange('desktop')}
          >
            Desktop mic
          </Button>
          <Button
            type="button"
            variant={defaultRecordingMethod === 'mobile' ? 'default' : 'ghost'}
            className={`h-8 px-3 ${defaultRecordingMethod === 'mobile' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-slate-700'}`}
            onClick={() => onRecordingMethodChange('mobile')}
          >
            Mobile mic
          </Button>
        </div>
      </div>
        </>
      )}
    </Card>
  );
}

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import { createAuthHeaders } from '@/src/shared/utils';

export type RecordingMethod = 'desktop' | 'mobile';
export type DefaultInputMode = 'audio' | 'typed';

export type UserSettings = {
  templateOrder: string[];
  favouriteTemplateId: string | null;
  defaultInputMode?: DefaultInputMode;
  defaultRecordingMethod?: RecordingMethod;
};

type UserSettingsState = {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
};

type UserSettingsActions = {
  loadSettings: (userId?: string | null, userTier?: string) => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>, userId?: string | null, userTier?: string) => Promise<void>;
};

type Store = UserSettingsState & UserSettingsActions;

const initialState: UserSettingsState = {
  settings: null,
  loading: false,
  error: null,
};

export const useUserSettingsStore = create<Store>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    loadSettings: async (userId, userTier) => {
      try {
        set({ loading: true, error: null });
        const res = await fetch('/api/user/settings', {
          headers: createAuthHeaders(userId, userTier),
        });
        if (!res.ok) {
          throw new Error(await res.text().catch(() => 'Failed to load settings'));
        }
        const data = await res.json();
        set({ settings: data.settings as UserSettings, loading: false });
      } catch (e) {
        set({ error: e instanceof Error ? e.message : 'Failed to load settings', loading: false });
      }
    },

    updateSettings: async (partial, userId, userTier) => {
      const current = get().settings || { templateOrder: [], favouriteTemplateId: null } as UserSettings;
      const next = { ...current, ...partial } as UserSettings;
      // optimistic update
      set({ settings: next });
      try {
        await fetch('/api/user/settings', {
          method: 'POST',
          headers: createAuthHeaders(userId, userTier),
          body: JSON.stringify({ settings: next }),
        });
      } catch {
        // best-effort: reload on failure
        set({ settings: current });
      }
    },
  })),
);


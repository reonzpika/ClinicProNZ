import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Helper function to get token data from localStorage
function getMobileTokenDataFromStorage(): {
  token: string;
  mobileUrl: string;
} | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem('mobileV2TokenData');
    if (!stored) return null;
    
    const tokenData = JSON.parse(stored);
    
    return tokenData;
  } catch {
    localStorage.removeItem('mobileV2TokenData');
    return null;
  }
}

// Helper function to save token data to localStorage
function saveMobileTokenDataToStorage(tokenData: {
  token: string;
  mobileUrl: string;
} | null): void {
  if (typeof window === 'undefined') return;
  
  if (tokenData) {
    localStorage.setItem('mobileV2TokenData', JSON.stringify(tokenData));
  } else {
    localStorage.removeItem('mobileV2TokenData');
  }
}

type MobileState = {
  // Mobile V2 state
  mobileV2: {
    isEnabled: boolean;
    token: string | null;
    tokenData: {
      token: string;
      mobileUrl: string;
    } | null;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    sessionSynced: boolean;
  };
};

type MobileActions = {
  // Mobile V2 actions
  enableMobileV2: (enabled: boolean) => void;
  setMobileV2Token: (token: string | null) => void;
  setMobileV2TokenData: (tokenData: {
    token: string;
    mobileUrl: string;
    expiresAt: string;
  } | null) => void;
  setMobileV2ConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void;
  setMobileV2SessionSynced: (synced: boolean) => void;

  // Reset actions
  resetMobileState: () => void;
};

type MobileStore = MobileState & MobileActions;

// Get initial token data from localStorage
const initialTokenData = getMobileTokenDataFromStorage();

const initialState: MobileState = {
  mobileV2: {
    isEnabled: !!initialTokenData,
    token: initialTokenData?.token || null,
    tokenData: initialTokenData,
    connectionStatus: 'disconnected',
    sessionSynced: false,
  },
};

export const useMobileStore = create<MobileStore>()(
  subscribeWithSelector(set => ({
    ...initialState,

    // Mobile V2 actions
    enableMobileV2: enabled =>
      set(state => ({
        mobileV2: { ...state.mobileV2, isEnabled: enabled },
      })),

    setMobileV2Token: token =>
      set(state => ({
        mobileV2: { ...state.mobileV2, token },
      })),

    setMobileV2TokenData: tokenData => {
      // Save to localStorage whenever token data changes
      saveMobileTokenDataToStorage(tokenData);
      
      set(state => ({
        mobileV2: { 
          ...state.mobileV2, 
          tokenData,
          // Update token field as well when tokenData changes
          token: tokenData?.token || null,
        },
      }));
    },

    setMobileV2ConnectionStatus: connectionStatus =>
      set(state => ({
        mobileV2: { ...state.mobileV2, connectionStatus },
      })),

    setMobileV2SessionSynced: sessionSynced =>
      set(state => ({
        mobileV2: { ...state.mobileV2, sessionSynced },
      })),

    // Reset actions
    resetMobileState: () => {
      // Clear localStorage when resetting
      saveMobileTokenDataToStorage(null);
      set({
        mobileV2: {
          isEnabled: false,
          token: null,
          tokenData: null,
          connectionStatus: 'disconnected',
          sessionSynced: false,
        },
      });
    },
  })),
);

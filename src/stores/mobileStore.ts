import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

interface MobileState {
  // Mobile V2 state
  mobileV2: {
    isEnabled: boolean
    token: string | null
    tokenData: {
      token: string
      mobileUrl: string
      expiresAt: string
    } | null
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
    sessionSynced: boolean
  }
}

interface MobileActions {
  // Mobile V2 actions
  enableMobileV2: (enabled: boolean) => void
  setMobileV2Token: (token: string | null) => void
  setMobileV2TokenData: (tokenData: {
    token: string
    mobileUrl: string
    expiresAt: string
  } | null) => void
  setMobileV2ConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => void
  setMobileV2SessionSynced: (synced: boolean) => void
  
  // Reset actions
  resetMobileState: () => void
}

type MobileStore = MobileState & MobileActions

const initialState: MobileState = {
  mobileV2: {
    isEnabled: false,
    token: null,
    tokenData: null,
    connectionStatus: 'disconnected',
    sessionSynced: false,
  },
}

export const useMobileStore = create<MobileStore>()(
  subscribeWithSelector((set) => ({
    ...initialState,
    
    // Mobile V2 actions
    enableMobileV2: (enabled) =>
      set((state) => ({
        mobileV2: { ...state.mobileV2, isEnabled: enabled }
      })),
    
    setMobileV2Token: (token) =>
      set((state) => ({
        mobileV2: { ...state.mobileV2, token }
      })),
    
    setMobileV2TokenData: (tokenData) =>
      set((state) => ({
        mobileV2: { ...state.mobileV2, tokenData }
      })),
    
    setMobileV2ConnectionStatus: (connectionStatus) =>
      set((state) => ({
        mobileV2: { ...state.mobileV2, connectionStatus }
      })),
    
    setMobileV2SessionSynced: (sessionSynced) =>
      set((state) => ({
        mobileV2: { ...state.mobileV2, sessionSynced }
      })),
    
    // Reset actions
    resetMobileState: () => set(initialState),
  }))
)
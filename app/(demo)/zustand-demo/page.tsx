'use client'

import React from 'react'
import { ZustandTranscriptionDemo } from '@/src/components/consultation/ZustandTranscriptionDemo'
import { ZustandConsultationDemo } from '@/src/components/consultation/ZustandConsultationDemo'
import { SessionManager } from '@/src/components/consultation/SessionManager'

export default function ZustandDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Phase 2: Zustand Client State Demo</h1>
        <p className="text-gray-600 max-w-3xl mx-auto">
          This page demonstrates the new Zustand stores for client state management alongside 
          React Query for server state. This shows how the monolithic ConsultationContext 
          is being split into specialized, performant stores.
        </p>
      </div>

      {/* React Query + Zustand Combined View */}
      <div className="grid gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Server State (React Query)</h2>
          <p className="text-sm text-gray-600">
            Patient sessions managed by React Query with automatic caching, background updates, and optimistic mutations.
          </p>
          <SessionManager />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Client State - Transcription (Zustand)</h2>
          <p className="text-sm text-gray-600">
            Input handling, transcription, and audio settings managed by Zustand for optimal performance.
          </p>
          <ZustandTranscriptionDemo />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Client State - Consultation (Zustand)</h2>
          <p className="text-sm text-gray-600">
            Consultation notes, chat history, and UI state managed by Zustand with fine-grained reactivity.
          </p>
          <ZustandConsultationDemo />
        </div>
      </div>

      {/* Architecture Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Phase 2 Architecture</h3>
          <div className="space-y-3 text-blue-800 text-sm">
            <div>
              <strong>React Query (Server State):</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Patient sessions CRUD</li>
                <li>• Notes generation</li>
                <li>• Background synchronization</li>
                <li>• Automatic retries & caching</li>
              </ul>
            </div>
            <div>
              <strong>Zustand (Client State):</strong>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Transcription & input handling</li>
                <li>• UI state & settings</li>
                <li>• Chat history</li>
                <li>• Mobile connection state</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Migration Benefits</h3>
          <ul className="text-green-800 space-y-2 text-sm">
            <li>✅ <strong>50+ state properties</strong> split into focused domains</li>
            <li>✅ <strong>Performance optimized</strong> with fine-grained subscriptions</li>
            <li>✅ <strong>No more re-renders</strong> from unrelated state changes</li>
            <li>✅ <strong>Memory leaks eliminated</strong> with proper cleanup</li>
            <li>✅ <strong>TypeScript first</strong> with full type safety</li>
            <li>✅ <strong>Testing simplified</strong> with isolated stores</li>
            <li>✅ <strong>DevTools ready</strong> for both React Query & Zustand</li>
          </ul>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-purple-900 mb-4">Implementation Status</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">✅ Phase 1 Complete</h4>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• React Query setup</li>
              <li>• API layer created</li>
              <li>• Server state migrated</li>
              <li>• Demo components working</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">🔄 Phase 2 In Progress</h4>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Zustand stores created</li>
              <li>• Client state separated</li>
              <li>• Demo components working</li>
              <li>• Ready for gradual migration</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-purple-900 mb-2">⏳ Phase 3 Pending</h4>
            <ul className="text-purple-800 space-y-1 text-sm">
              <li>• Migrate components gradually</li>
              <li>• Remove ConsultationContext</li>
              <li>• Performance testing</li>
              <li>• Production deployment</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Developer Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Developer Notes</h3>
        <div className="text-gray-700 text-sm space-y-2">
          <p>
            <strong>Gradual Migration Strategy:</strong> The new Zustand stores can be used alongside 
            the existing ConsultationContext during migration. Components can be migrated one at a time 
            using the <code className="bg-gray-200 px-1 rounded">useConsultationStores()</code> hook 
            which provides the same interface.
          </p>
          <p>
            <strong>Performance Testing:</strong> Open browser DevTools to see the difference in 
            re-render frequency. Zustand components only re-render when their specific data changes, 
            not when unrelated state updates.
          </p>
          <p>
            <strong>State Persistence:</strong> User settings like microphone gain and volume threshold 
            automatically persist to localStorage, providing a better user experience.
          </p>
        </div>
      </div>
    </div>
  )
}
'use client'

import React from 'react'
import { SessionManager } from '@/src/components/consultation/SessionManager'
import { ConsultationNotesGenerator } from '@/src/components/consultation/ConsultationNotesGenerator'

export default function ReactQueryDemoPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">React Query Migration Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This page demonstrates the new React Query implementation for consultation state management.
          These components show how server state will be handled after the migration from ConsultationContext.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Session Management</h2>
          <p className="text-sm text-gray-600">
            Demonstrates React Query hooks for CRUD operations on patient sessions with automatic caching and optimistic updates.
          </p>
          <SessionManager />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Consultation Notes Generator</h2>
          <p className="text-sm text-gray-600">
            Shows how consultation notes generation will work with React Query mutations and error handling.
          </p>
          <ConsultationNotesGenerator 
            onSuccess={(notes) => {
              console.log('Generated notes:', notes)
              alert('Notes generated successfully!')
            }}
            onError={(error) => {
              console.error('Error generating notes:', error)
              alert(`Error: ${error.message}`)
            }}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Migration Benefits</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• <strong>Automatic Caching:</strong> Server responses are cached and reused automatically</li>
          <li>• <strong>Background Updates:</strong> Data refreshes in the background without blocking UI</li>
          <li>• <strong>Optimistic Updates:</strong> UI updates immediately, then syncs with server</li>
          <li>• <strong>Error Handling:</strong> Built-in retry logic and error state management</li>
          <li>• <strong>Loading States:</strong> Automatic pending states for all operations</li>
          <li>• <strong>Data Synchronization:</strong> Multiple components stay in sync automatically</li>
        </ul>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-2">Current Status</h3>
        <ul className="text-green-800 space-y-1 text-sm">
          <li>✅ React Query v5 installed and configured</li>
          <li>✅ Query client with optimized defaults setup</li>
          <li>✅ API layer created for consultation endpoints</li>
          <li>✅ React Query hooks for all consultation operations</li>
          <li>✅ Demo components showing new patterns</li>
          <li>🔄 Phase 1 (Server State) - In Progress</li>
          <li>⏳ Phase 2 (Client State with Zustand) - Pending</li>
          <li>⏳ Phase 3 (Remove ConsultationContext) - Pending</li>
        </ul>
      </div>
    </div>
  )
}
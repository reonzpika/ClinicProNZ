'use client';

import React from 'react';
import { Header } from '@/shared/components/Header';
import { Footer } from '@/shared/components/Footer';

export default function ConsultationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Consultation Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Selection */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4">Select Template</h2>
              <div className="space-y-2">
                <select className="template-select">
                  <option>Multi-problem SOAP (Default)</option>
                  <option>Driver's License Medical</option>
                  <option>6-week Baby Check</option>
                  <option>Initial Medical</option>
                </select>
              </div>
            </section>

            {/* Transcription Controls */}
            <section className="card">
              <div className="flex space-x-4 mb-4">
                <button className="btn-primary">
                  Start Recording
                </button>
                <button className="btn-secondary">
                  Pause
                </button>
                <button className="btn-danger">
                  Stop
                </button>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm text-gray-600">Latest Transcription:</p>
                <p className="mt-2">Dr: And how long have you...</p>
              </div>
            </section>

            {/* Quick Notes */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4">Quick Notes</h2>
              <textarea
                className="quick-notes"
                placeholder="Type your quick notes here..."
              />
              <p className="text-sm text-gray-500 mt-2">Auto-saves as you type</p>
            </section>

            {/* Generated Notes */}
            <section className="card">
              <h2 className="text-lg font-semibold mb-4">Generated Notes</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Subjective:</h3>
                  <textarea className="input" />
                </div>
                <div>
                  <h3 className="font-medium">Objective:</h3>
                  <textarea className="input" />
                </div>
                <div>
                  <h3 className="font-medium">Assessment:</h3>
                  <textarea className="input" />
                </div>
                <div>
                  <h3 className="font-medium">Plan:</h3>
                  <textarea className="input" />
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <button className="btn-primary">
                  Generate Notes
                </button>
                <button className="btn-secondary">
                  Copy to Clipboard
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Future Features */}
          <div className="lg:col-span-1">
            <section className="card">
              <h2 className="text-lg font-semibold mb-4">Future Features</h2>
              <p className="text-gray-600">
                This space is reserved for future features like NZ Resources, Tools, etc.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
} 
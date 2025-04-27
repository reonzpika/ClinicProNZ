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
            <section className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Select Template</h2>
              <div className="space-y-2">
                <select className="w-full p-2 border rounded-md">
                  <option>Multi-problem SOAP (Default)</option>
                  <option>Driver's License Medical</option>
                  <option>6-week Baby Check</option>
                  <option>Initial Medical</option>
                </select>
              </div>
            </section>

            {/* Transcription Controls */}
            <section className="bg-white rounded-lg shadow p-4">
              <div className="flex space-x-4 mb-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Start Recording
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  Pause
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                  Stop
                </button>
              </div>
              <div className="border rounded-md p-4">
                <p className="text-sm text-gray-600">Latest Transcription:</p>
                <p className="mt-2">Dr: And how long have you...</p>
              </div>
            </section>

            {/* Quick Notes */}
            <section className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Quick Notes</h2>
              <textarea
                className="w-full h-32 p-2 border rounded-md"
                placeholder="Type your quick notes here..."
              />
              <p className="text-sm text-gray-500 mt-2">Auto-saves as you type</p>
            </section>

            {/* Generated Notes */}
            <section className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Generated Notes</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Subjective:</h3>
                  <textarea className="w-full h-24 p-2 border rounded-md" />
                </div>
                <div>
                  <h3 className="font-medium">Objective:</h3>
                  <textarea className="w-full h-24 p-2 border rounded-md" />
                </div>
                <div>
                  <h3 className="font-medium">Assessment:</h3>
                  <textarea className="w-full h-24 p-2 border rounded-md" />
                </div>
                <div>
                  <h3 className="font-medium">Plan:</h3>
                  <textarea className="w-full h-24 p-2 border rounded-md" />
                </div>
              </div>
              <div className="flex space-x-4 mt-4">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Generate Notes
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
                  Copy to Clipboard
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Future Features */}
          <div className="lg:col-span-1">
            <section className="bg-white rounded-lg shadow p-4">
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
'use client';

import { TrafficLightContent } from './TrafficLightContent';

function scrollToSection(section: string) {
  document.getElementById(`${section}-zone`)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function TrafficLightPanel() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-white">
      <div className="shrink-0 border-b border-border p-4">
        <h3 className="mb-3 text-xl font-bold text-text-primary">
          Traffic Light Medication Checker
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => scrollToSection('green')}
            className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 transition-colors hover:bg-green-200"
          >
            GREEN
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('amber')}
            className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-800 transition-colors hover:bg-amber-200"
          >
            AMBER
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('red')}
            className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:bg-red-200"
          >
            RED
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <TrafficLightContent />
      </div>
    </div>
  );
}

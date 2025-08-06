'use client';

import { useState } from 'react';

import { mockSessionData } from '../data/mockData';
import { FilterOptions, SessionData } from '../types';
import { SessionDetailModal } from './SessionDetailModal';
import { SessionFilters } from './SessionFilters';
import { SessionTable } from './SessionTable';

export function SessionLogTab() {
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: { from: null, to: null },
    template: 'All Templates',
    status: 'All Statuses',
    satisfaction: [1],
    search: ''
  });

  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSessionClick = (session: SessionData) => {
    setSelectedSession(session);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <SessionFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Session Table */}
      <SessionTable
        sessions={mockSessionData}
        filters={filters}
        onSessionClick={handleSessionClick}
      />

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
'use client';

import { Copy, Eye, Flag } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/components/ui/table';

import { FilterOptions, SessionData } from '../types';

interface SessionTableProps {
  sessions: SessionData[];
  filters: FilterOptions;
  onSessionClick: (session: SessionData) => void;
}

const ITEMS_PER_PAGE = 10;

export function SessionTable({ sessions, filters, onSessionClick }: SessionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter sessions based on current filters
  const filteredSessions = sessions.filter(session => {
    // Template filter
    if (filters.template !== 'All Templates' && session.template !== filters.template) {
      return false;
    }
    
    // Status filter  
    if (filters.status !== 'All Statuses' && session.status !== filters.status.toLowerCase()) {
      return false;
    }
    
    // Search filter
    if (filters.search && !session.id.toLowerCase().includes(filters.search.toLowerCase()) &&
        !session.template.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Satisfaction filter
    if (filters.satisfaction.length > 0 && session.satisfaction !== undefined && 
        filters.satisfaction[0] !== undefined && session.satisfaction < filters.satisfaction[0]) {
      return false;
    }
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSessions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'edited':
        return <Badge className="bg-amber-100 text-amber-800">Edited</Badge>;
      case 'generated':
        return <Badge className="bg-blue-100 text-blue-800">Generated</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
  };

  const handleCopyId = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sessionId);
    // TODO: Add toast notification
    console.log(`Copied session ID: ${sessionId}`);
  };

  const handleFlag = (session: SessionData, e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement flagging functionality
    console.log(`Flagged session: ${session.id}`);
  };

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Template</TableHead>
              <TableHead>Duration (min)</TableHead>
              <TableHead>Gen. Time (s)</TableHead>
              <TableHead>Completion (min)</TableHead>
              <TableHead>Satisfaction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Consent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSessions.map((session) => (
              <TableRow 
                key={session.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onSessionClick(session)}
              >
                <TableCell className="font-medium text-blue-600">
                  {session.id}
                </TableCell>
                <TableCell>
                  {new Date(session.dateTime).toLocaleString('en-NZ', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </TableCell>
                <TableCell>{session.template}</TableCell>
                <TableCell>{session.duration}</TableCell>
                <TableCell>{session.generationTime}</TableCell>
                <TableCell>{session.completionTime}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {renderStars(session.satisfaction)}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(session.status)}</TableCell>
                <TableCell>
                  <span className={session.consent ? 'text-green-600' : 'text-red-600'}>
                    {session.consent ? '✓' : '✗'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick(session);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleFlag(session, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Flag className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleCopyId(session.id, e)}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredSessions.length)} of{' '}
          {filteredSessions.length} sessions
        </p>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';

import { Badge } from '@/src/shared/components/ui/badge';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';

type MessageType = 'contact' | 'feedback' | 'survey';
type MessageStatus = 'new' | 'read' | 'replied';

type Message = {
  id: string;
  type: MessageType;
  name: string | null;
  email: string | null;
  subject: string;
  message: string;
  userTier: string | null;
  userId: string | null;
  source: string;
  status: MessageStatus;
  createdAt: string;
};

type MessagesStats = {
  total: number;
  contact: number;
  feedback: number;
  survey: number;
  new: number;
};

export const MessagesView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessagesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<MessageType | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<MessageStatus | 'all'>('all');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data.messages || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId: string, type: MessageType, newStatus: MessageStatus) => {
    try {
      const response = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, type, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message status');
      }

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status: newStatus } : msg,
      ));

      // Refresh stats
      fetchMessages();
    } catch (err) {
      console.error('Failed to update message status:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    const typeMatch = selectedType === 'all' || msg.type === selectedType;
    const statusMatch = selectedStatus === 'all' || msg.status === selectedStatus;
    return typeMatch && statusMatch;
  });

  const getTypeColor = (type: MessageType) => {
    switch (type) {
      case 'contact': return 'bg-blue-100 text-blue-800';
      case 'feedback': return 'bg-green-100 text-green-800';
      case 'survey': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'read': return 'bg-yellow-100 text-yellow-800';
      case 'replied': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-32 rounded-lg bg-gray-200" />
          <div className="h-64 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
Error:
{error}
          </p>
          <Button onClick={fetchMessages} className="mt-2" size="sm">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
        <Button onClick={fetchMessages} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.contact}</div>
              <div className="text-sm text-gray-600">Contact</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.feedback}</div>
              <div className="text-sm text-gray-600">Feedback</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.survey}</div>
              <div className="text-sm text-gray-600">Survey</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.new}</div>
              <div className="text-sm text-gray-600">New</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="message-type-filter" className="text-sm font-medium text-gray-700">Type:</label>
          <select
            id="message-type-filter"
            value={selectedType}
            onChange={e => setSelectedType(e.target.value as MessageType | 'all')}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="all">All Types</option>
            <option value="contact">Contact</option>
            <option value="feedback">Feedback</option>
            <option value="survey">Survey</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="message-status-filter" className="text-sm font-medium text-gray-700">Status:</label>
          <select
            id="message-status-filter"
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as MessageStatus | 'all')}
            className="rounded-md border border-gray-300 px-3 py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        <div className="text-sm text-gray-600">
          Showing
{' '}
{filteredMessages.length}
{' '}
of
{' '}
{messages.length}
{' '}
messages
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map(message => (
          <Card key={message.id} className={`transition-shadow hover:shadow-md ${message.status === 'new' ? 'border-l-4 border-l-red-500' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(message.type)}>
                    {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(message.status)}>
                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                  </Badge>
                  {message.userTier && (
                    <Badge variant="secondary">
                      {message.userTier}
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(message.createdAt).toLocaleDateString()}
{' '}
{new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>

              <CardTitle className="text-lg">
                {message.subject}
              </CardTitle>

              {message.name && (
                <div className="text-sm text-gray-600">
                  From:
{' '}
{message.name}
{' '}
{message.email && `(${message.email})`}
                </div>
              )}
              {!message.name && message.email && (
                <div className="text-sm text-gray-600">
                  From:
{' '}
{message.email}
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="mb-4 line-clamp-3 text-gray-700">
                {message.message}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Source:
{' '}
{message.source}
{' '}
• ID:
{' '}
{message.id}
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => setSelectedMessage(message)}
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>

                  {message.type === 'contact' && message.status === 'new' && (
                    <Button
                      onClick={() => updateMessageStatus(message.id, message.type, 'read')}
                      variant="outline"
                      size="sm"
                    >
                      Mark Read
                    </Button>
                  )}

                  {message.type === 'contact' && message.status === 'read' && (
                    <Button
                      onClick={() => updateMessageStatus(message.id, message.type, 'replied')}
                      variant="outline"
                      size="sm"
                    >
                      Mark Replied
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMessages.length === 0 && (
          <div className="py-12 text-center">
            <div className="text-gray-500">
              {messages.length === 0 ? 'No messages yet' : 'No messages match the selected filters'}
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg">
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">Message Details</h3>
                <Button
                  onClick={() => setSelectedMessage(null)}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Badge className={getTypeColor(selectedMessage.type)}>
                    {selectedMessage.type.charAt(0).toUpperCase() + selectedMessage.type.slice(1)}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900">Subject:</h4>
                  <p className="text-gray-700">{selectedMessage.subject}</p>
                </div>

                {selectedMessage.name && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Name:</h4>
                    <p className="text-gray-700">{selectedMessage.name}</p>
                  </div>
                )}

                {selectedMessage.email && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Email:</h4>
                    <p className="text-gray-700">{selectedMessage.email}</p>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900">Message:</h4>
                  <div className="whitespace-pre-wrap rounded border bg-gray-50 p-3 text-gray-700">
                    {selectedMessage.message}
                  </div>
                </div>

                <div className="text-sm text-gray-500">
                  <p>
Source:
{selectedMessage.source}
                  </p>
                  <p>
Created:
{new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                  <p>
ID:
{selectedMessage.id}
                  </p>
                  {selectedMessage.userTier && (
<p>
User Tier:
{selectedMessage.userTier}
</p>
)}
                  {selectedMessage.userId && (
<p>
User ID:
{selectedMessage.userId}
</p>
)}
                </div>

                {selectedMessage.type === 'contact' && (
                  <div className="flex space-x-2 border-t pt-4">
                    {selectedMessage.status === 'new' && (
                      <Button
                        onClick={() => {
                          updateMessageStatus(selectedMessage.id, selectedMessage.type, 'read');
                          setSelectedMessage(prev => prev ? { ...prev, status: 'read' } : null);
                        }}
                        size="sm"
                      >
                        Mark as Read
                      </Button>
                    )}
                    {selectedMessage.status === 'read' && (
                      <Button
                        onClick={() => {
                          updateMessageStatus(selectedMessage.id, selectedMessage.type, 'replied');
                          setSelectedMessage(prev => prev ? { ...prev, status: 'replied' } : null);
                        }}
                        size="sm"
                      >
                        Mark as Replied
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

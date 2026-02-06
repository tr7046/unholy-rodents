'use client';

import { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  EnvelopeOpenIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  FunnelIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '../components/QuickNav';

interface Message {
  id: string;
  type: 'booking' | 'press' | 'general' | 'merch';
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: 'new_msg' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

interface MessagesData {
  data: Message[];
  total: number;
  unreadCount: number;
}

const typeLabels: Record<string, string> = {
  booking: 'Booking',
  press: 'Press',
  general: 'General',
  merch: 'Merch',
};

const typeColors: Record<string, string> = {
  booking: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  press: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  general: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  merch: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusLabels: Record<string, string> = {
  new_msg: 'New',
  read: 'Read',
  replied: 'Replied',
  archived: 'Archived',
};

const statusColors: Record<string, string> = {
  new_msg: 'bg-[#c41e3a] text-white',
  read: 'bg-[#252525] text-[#888888]',
  replied: 'bg-green-500/20 text-green-400',
  archived: 'bg-[#1a1a1a] text-[#666]',
};

export default function MessagesAdminPage() {
  const [data, setData] = useState<MessagesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [filter, setFilter] = useState<{ status: string; type: string }>({ status: 'all', type: 'all' });
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [filter]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status !== 'all') params.set('status', filter.status);
      if (filter.type !== 'all') params.set('type', filter.type);

      const res = await fetch(`/api/admin/messages?${params}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        await fetchData();
        if (selectedMessage?.id === id) {
          setSelectedMessage((prev) => prev ? { ...prev, status: status as Message['status'] } : null);
        }
      }
    } finally {
      setUpdating(null);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message ya sure cunt?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        if (selectedMessage?.id === id) {
          setSelectedMessage(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  }

  function openMessage(message: Message) {
    setSelectedMessage(message);
    if (message.status === 'new_msg') {
      updateStatus(message.id, 'read');
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading && !data) {
    return <div className="text-[#888888]">Loading messages...</div>;
  }

  const messages = data?.data || [];
  const unreadCount = data?.unreadCount || 0;

  return (
    <div>
      <PageHeader
        title="Messages"
        subtitle={`${data?.total || 0} total${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        current="messages"
        related={['dashboard']}
        action={
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-[#252525] hover:bg-[#333] text-[#f5f5f0] px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-[#888888]" />
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
          >
            <option value="all">All Status</option>
            <option value="new_msg">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <select
          value={filter.type}
          onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
          className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
        >
          <option value="all">All Types</option>
          <option value="booking">Booking</option>
          <option value="press">Press</option>
          <option value="merch">Merch</option>
          <option value="general">General</option>
        </select>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-12 text-center">
          <EnvelopeIcon className="w-12 h-12 text-[#666] mx-auto mb-4" />
          <p className="text-[#888888]">No messages yet ya lonely bugger. Go promote the band!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => openMessage(message)}
              className={`bg-[#1a1a1a] border rounded-lg p-4 cursor-pointer transition-colors hover:border-[#c41e3a] ${
                message.status === 'new_msg' ? 'border-[#c41e3a]/50' : 'border-[#333]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-shrink-0 mt-1">
                    {message.status === 'new_msg' ? (
                      <EnvelopeIcon className="w-5 h-5 text-[#c41e3a]" />
                    ) : (
                      <EnvelopeOpenIcon className="w-5 h-5 text-[#666]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium ${message.status === 'new_msg' ? 'text-[#f5f5f0]' : 'text-[#888888]'}`}>
                        {message.name}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${typeColors[message.type]}`}>
                        {typeLabels[message.type]}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded ${statusColors[message.status]}`}>
                        {statusLabels[message.status]}
                      </span>
                    </div>
                    <div className="text-sm text-[#888888] truncate mt-1">
                      {message.email}
                    </div>
                    <div className={`text-sm truncate mt-1 ${message.status === 'new_msg' ? 'text-[#f5f5f0]' : 'text-[#666]'}`}>
                      {message.message}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#666]">{formatDate(message.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs rounded border ${typeColors[selectedMessage.type]}`}>
                  {typeLabels[selectedMessage.type]}
                </span>
                <span className={`px-2 py-1 text-xs rounded ${statusColors[selectedMessage.status]}`}>
                  {statusLabels[selectedMessage.status]}
                </span>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-[#888888] hover:text-[#f5f5f0]"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-[#888888] mb-1">From</div>
                  <div className="text-[#f5f5f0] font-medium">{selectedMessage.name}</div>
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="text-[#c41e3a] hover:text-[#e63946] text-sm"
                  >
                    {selectedMessage.email}
                  </a>
                </div>

                {selectedMessage.subject && (
                  <div>
                    <div className="text-sm text-[#888888] mb-1">Subject</div>
                    <div className="text-[#f5f5f0]">{selectedMessage.subject}</div>
                  </div>
                )}

                <div>
                  <div className="text-sm text-[#888888] mb-1">Message</div>
                  <div className="text-[#f5f5f0] whitespace-pre-wrap bg-[#0a0a0a] rounded-lg p-4 border border-[#333]">
                    {selectedMessage.message}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-[#888888] mb-1">Received</div>
                  <div className="text-[#f5f5f0]">
                    {new Date(selectedMessage.createdAt).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 p-6 border-t border-[#333]">
              <div className="flex items-center gap-2">
                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'replied')}
                    disabled={updating === selectedMessage.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50"
                  >
                    <CheckIcon className="w-4 h-4" />
                    Mark Replied
                  </button>
                )}
                {selectedMessage.status !== 'archived' && (
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'archived')}
                    disabled={updating === selectedMessage.id}
                    className="flex items-center gap-2 px-4 py-2 bg-[#252525] text-[#888888] rounded-lg hover:bg-[#333] transition-colors disabled:opacity-50"
                  >
                    Archive
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Your message to Unholy Rodents'}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg transition-colors"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  Reply via Email
                </a>
                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="p-2 text-[#888888] hover:text-[#c41e3a] hover:bg-[#252525] rounded-lg transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

interface Show {
  id: string;
  date: string;
  venue: {
    name: string;
    city: string;
    state: string;
  };
  doorsTime?: string;
  ticketUrl?: string | null;
  bands?: { name: string; isHeadliner: boolean }[];
}

interface ShowsData {
  upcomingShows: Show[];
  pastShows: Show[];
}

const defaultShow: Omit<Show, 'id'> = {
  date: '',
  venue: { name: '', city: '', state: '' },
  doorsTime: '',
  ticketUrl: '',
  bands: [{ name: 'Unholy Rodents', isHeadliner: true }],
};

export default function ShowsAdminPage() {
  const [data, setData] = useState<ShowsData | null>(null);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
  const [editingType, setEditingType] = useState<'upcoming' | 'past'>('upcoming');
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/admin/shows');
    if (res.ok) {
      setData(await res.json());
    }
  }

  async function handleSave(show: Partial<Show>, type: 'upcoming' | 'past') {
    setSaving(true);
    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/shows', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show, type }),
      });

      if (res.ok) {
        await fetchData();
        setEditingShow(null);
        setIsCreating(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, type: 'upcoming' | 'past') {
    if (!confirm('Delete this show ya cunt?')) return;

    await fetch(`/api/admin/shows?id=${id}&type=${type}`, { method: 'DELETE' });
    await fetchData();
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  const shows = activeTab === 'upcoming' ? data.upcomingShows : data.pastShows;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f0]">Shows</h1>
          <p className="text-[#888888] mt-1">
            {data.upcomingShows.length} upcoming, {data.pastShows.length} past
          </p>
        </div>
        <button
          onClick={() => {
            setIsCreating(true);
            setEditingType(activeTab);
            setEditingShow({ id: '', ...defaultShow } as Show);
          }}
          className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Book a Gig Cunt
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-[#c41e3a] text-white'
              : 'bg-[#1a1a1a] text-[#888888] hover:text-[#f5f5f0]'
          }`}
        >
          Upcoming ({data.upcomingShows.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'past'
              ? 'bg-[#c41e3a] text-white'
              : 'bg-[#1a1a1a] text-[#888888] hover:text-[#f5f5f0]'
          }`}
        >
          Past ({data.pastShows.length})
        </button>
      </div>

      {/* Shows List */}
      {shows.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-12 text-center">
          <CalendarIcon className="w-12 h-12 text-[#666] mx-auto mb-4" />
          <p className="text-[#888888]">No {activeTab} shows ya lazy bugger. Book a gig!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {shows.map((show) => (
            <div
              key={show.id}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#c41e3a]">
                      {new Date(show.date).getDate()}
                    </div>
                    <div className="text-sm text-[#888888] uppercase">
                      {new Date(show.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                    <div className="text-sm text-[#888888]">
                      {new Date(show.date).getFullYear()}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#f5f5f0]">{show.venue.name}</h3>
                    <div className="flex items-center gap-2 text-[#888888] mt-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>
                        {show.venue.city}, {show.venue.state}
                      </span>
                    </div>
                    {show.doorsTime && (
                      <div className="text-sm text-[#888888] mt-2">Doors: {show.doorsTime}</div>
                    )}
                    {show.bands && show.bands.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {show.bands.map((band, i) => (
                          <span
                            key={i}
                            className={`px-2 py-1 rounded text-xs ${
                              band.isHeadliner
                                ? 'bg-[#c41e3a] text-white'
                                : 'bg-[#252525] text-[#888888]'
                            }`}
                          >
                            {band.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingShow(show);
                      setEditingType(activeTab);
                    }}
                    className="p-2 text-[#888888] hover:text-[#f5f5f0] hover:bg-[#252525] rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(show.id, activeTab)}
                    className="p-2 text-[#888888] hover:text-[#c41e3a] hover:bg-[#252525] rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingShow && (
        <ShowModal
          show={editingShow}
          type={editingType}
          isCreating={isCreating}
          saving={saving}
          onSave={handleSave}
          onClose={() => {
            setEditingShow(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

function ShowModal({
  show,
  type,
  isCreating,
  saving,
  onSave,
  onClose,
}: {
  show: Show;
  type: 'upcoming' | 'past';
  isCreating: boolean;
  saving: boolean;
  onSave: (show: Partial<Show>, type: 'upcoming' | 'past') => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(show);
  const [showType, setShowType] = useState(type);

  function updateField(field: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateVenue(field: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      venue: { ...prev.venue, [field]: value },
    }));
  }

  function updateBand(index: number, field: string, value: unknown) {
    const bands = [...(formData.bands || [])];
    bands[index] = { ...bands[index], [field]: value };
    setFormData((prev) => ({ ...prev, bands }));
  }

  function addBand() {
    setFormData((prev) => ({
      ...prev,
      bands: [...(prev.bands || []), { name: '', isHeadliner: false }],
    }));
  }

  function removeBand(index: number) {
    setFormData((prev) => ({
      ...prev,
      bands: (prev.bands || []).filter((_, i) => i !== index),
    }));
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-[#f5f5f0]">
            {isCreating ? 'Book a Show Ya Legend' : 'Edit This Gig'}
          </h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f5f0]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Doors Time</label>
              <input
                type="text"
                value={formData.doorsTime || ''}
                onChange={(e) => updateField('doorsTime', e.target.value)}
                placeholder="7:00 PM"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Venue Name</label>
            <input
              type="text"
              value={formData.venue.name}
              onChange={(e) => updateVenue('name', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">City</label>
              <input
                type="text"
                value={formData.venue.city}
                onChange={(e) => updateVenue('city', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">State</label>
              <input
                type="text"
                value={formData.venue.state}
                onChange={(e) => updateVenue('state', e.target.value)}
                placeholder="FL"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Ticket URL</label>
            <input
              type="url"
              value={formData.ticketUrl || ''}
              onChange={(e) => updateField('ticketUrl', e.target.value || null)}
              placeholder="https://..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>

          {/* Bands */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#f5f5f0]">Bands</label>
              <button onClick={addBand} className="text-sm text-[#c41e3a] hover:text-[#e63946]">
                + Add Band
              </button>
            </div>
            <div className="space-y-2">
              {(formData.bands || []).map((band, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="text"
                    value={band.name}
                    onChange={(e) => updateBand(index, 'name', e.target.value)}
                    placeholder="Band name"
                    className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
                  />
                  <label className="flex items-center gap-2 text-sm text-[#888888]">
                    <input
                      type="checkbox"
                      checked={band.isHeadliner}
                      onChange={(e) => updateBand(index, 'isHeadliner', e.target.checked)}
                      className="w-4 h-4 rounded border-[#333] bg-[#0a0a0a] text-[#c41e3a]"
                    />
                    Headliner
                  </label>
                  <button
                    onClick={() => removeBand(index)}
                    className="text-[#888888] hover:text-[#c41e3a]"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Show Type */}
          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Show Type</label>
            <select
              value={showType}
              onChange={(e) => setShowType(e.target.value as 'upcoming' | 'past')}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-6 border-t border-[#333]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#888888] hover:text-[#f5f5f0] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData, showType)}
            disabled={saving}
            className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

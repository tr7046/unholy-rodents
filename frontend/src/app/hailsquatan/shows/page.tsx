'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  CalendarIcon,
  MapPinIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '../components/QuickNav';
import { toDateInputValue } from '@/lib/shows';

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
  posterUrl?: string | null;
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
  ticketUrl: null,
  posterUrl: null,
  bands: [{ name: 'Unholy Rodents', isHeadliner: true }],
};

export default function ShowsAdminPage() {
  const [data, setData] = useState<ShowsData | null>(null);
  const [editingShow, setEditingShow] = useState<Show | null>(null);
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
    } else if (res.status === 401) {
      window.location.href = '/hailsquatan';
    }
  }

  async function handleSave(show: Partial<Show>) {
    setSaving(true);
    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/shows', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show }),
      });

      if (res.ok) {
        await fetchData();
        setEditingShow(null);
        setIsCreating(false);
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Failed to save show');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this show ya cunt?')) return;

    await fetch(`/api/admin/shows?id=${id}`, { method: 'DELETE' });
    await fetchData();
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  const shows = activeTab === 'upcoming' ? data.upcomingShows : data.pastShows;

  return (
    <div>
      <PageHeader
        title="Shows"
        subtitle={`${data.upcomingShows.length} upcoming, ${data.pastShows.length} past`}
        current="shows"
        related={['music', 'media']}
        action={
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingShow({ id: '', ...defaultShow } as Show);
            }}
            className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Book a Gig Cunt
          </button>
        }
      />

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
                  {show.posterUrl && (
                    <img
                      src={show.posterUrl}
                      alt="Show poster"
                      className="w-16 h-20 object-cover rounded border border-[#333]"
                    />
                  )}
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
                    onClick={() => setEditingShow(show)}
                    className="p-2 text-[#888888] hover:text-[#f5f5f0] hover:bg-[#252525] rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(show.id)}
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
  isCreating,
  saving,
  onSave,
  onClose,
}: {
  show: Show;
  isCreating: boolean;
  saving: boolean;
  onSave: (show: Partial<Show>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(show);
  const [uploading, setUploading] = useState(false);

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

  async function handlePosterUpload(file: File) {
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'media');
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setFormData((prev) => ({ ...prev, posterUrl: url }));
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handlePosterUpload(file);
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
                value={toDateInputValue(formData.date)}
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

          {/* Poster Upload */}
          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Show Poster</label>
            {formData.posterUrl ? (
              <div className="relative inline-block">
                <img
                  src={formData.posterUrl}
                  alt="Poster"
                  className="w-32 h-40 object-cover rounded border border-[#333]"
                />
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, posterUrl: null }))}
                  className="absolute -top-2 -right-2 bg-[#c41e3a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-[#a01830]"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handlePosterUpload(file);
                  };
                  input.click();
                }}
                className="border-2 border-dashed border-[#333] rounded-lg p-8 text-center cursor-pointer hover:border-[#c41e3a] transition-colors"
              >
                {uploading ? (
                  <p className="text-[#888888]">Uploading...</p>
                ) : (
                  <>
                    <PhotoIcon className="w-10 h-10 text-[#666] mx-auto mb-2" />
                    <p className="text-sm text-[#888888]">Drop poster here or click to upload</p>
                    <p className="text-xs text-[#666] mt-1">JPG, PNG, GIF, WebP - Max 5MB</p>
                  </>
                )}
              </div>
            )}
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
            onClick={() => onSave(formData)}
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

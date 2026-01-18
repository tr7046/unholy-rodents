'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '../components/QuickNav';

interface Release {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single';
  releaseDate: string;
  coverArt: string;
  tracks: { title: string; duration: string }[];
  streamingLinks: { platform: string; url: string }[];
}

interface MusicData {
  releases: Release[];
  streamingPlatforms: { name: string; url: string; color: string }[];
}

const defaultRelease: Omit<Release, 'id'> = {
  title: '',
  type: 'single',
  releaseDate: '',
  coverArt: '',
  tracks: [{ title: '', duration: '' }],
  streamingLinks: [],
};

export default function MusicAdminPage() {
  const [data, setData] = useState<MusicData | null>(null);
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'releases' | 'platforms'>('releases');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/admin/music');
    if (res.ok) {
      setData(await res.json());
    }
  }

  async function handleSaveRelease(release: Partial<Release>) {
    setSaving(true);
    try {
      const method = isCreating ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/music', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(release),
      });

      if (res.ok) {
        await fetchData();
        setEditingRelease(null);
        setIsCreating(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRelease(id: string) {
    if (!confirm('Delete this banger ya sure mate?')) return;

    await fetch(`/api/admin/music?id=${id}`, { method: 'DELETE' });
    await fetchData();
  }

  async function handleSavePlatforms(platforms: MusicData['streamingPlatforms']) {
    setSaving(true);
    try {
      await fetch('/api/admin/music', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamingPlatforms: platforms }),
      });
      await fetchData();
    } finally {
      setSaving(false);
    }
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Music"
        subtitle={`${data.releases.length} releases`}
        current="music"
        related={['shows', 'media']}
        action={
          activeTab === 'releases' ? (
            <button
              onClick={() => {
                setIsCreating(true);
                setEditingRelease({ id: '', ...defaultRelease } as Release);
              }}
              className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Drop a Banger
            </button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('releases')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'releases'
              ? 'bg-[#c41e3a] text-white'
              : 'bg-[#1a1a1a] text-[#888888] hover:text-[#f5f5f0]'
          }`}
        >
          Releases
        </button>
        <button
          onClick={() => setActiveTab('platforms')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'platforms'
              ? 'bg-[#c41e3a] text-white'
              : 'bg-[#1a1a1a] text-[#888888] hover:text-[#f5f5f0]'
          }`}
        >
          Streaming Platforms
        </button>
      </div>

      {activeTab === 'releases' ? (
        <>
          {data.releases.length === 0 ? (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-12 text-center">
              <MusicalNoteIcon className="w-12 h-12 text-[#666] mx-auto mb-4" />
              <p className="text-[#888888]">No releases yet ya slacker. Write some tunes!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.releases.map((release) => (
                <div
                  key={release.id}
                  className="bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden"
                >
                  <div className="aspect-square bg-[#252525] flex items-center justify-center">
                    {release.coverArt ? (
                      <img
                        src={release.coverArt}
                        alt={release.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MusicalNoteIcon className="w-16 h-16 text-[#666]" />
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#f5f5f0]">{release.title}</h3>
                        <p className="text-sm text-[#888888] capitalize">
                          {release.type} - {release.tracks.length} tracks
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingRelease(release)}
                          className="p-2 text-[#888888] hover:text-[#f5f5f0] hover:bg-[#252525] rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRelease(release.id)}
                          className="p-2 text-[#888888] hover:text-[#c41e3a] hover:bg-[#252525] rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <PlatformsEditor
          platforms={data.streamingPlatforms}
          saving={saving}
          onSave={handleSavePlatforms}
        />
      )}

      {/* Release Modal */}
      {editingRelease && (
        <ReleaseModal
          release={editingRelease}
          isCreating={isCreating}
          saving={saving}
          onSave={handleSaveRelease}
          onClose={() => {
            setEditingRelease(null);
            setIsCreating(false);
          }}
        />
      )}
    </div>
  );
}

function PlatformsEditor({
  platforms,
  saving,
  onSave,
}: {
  platforms: MusicData['streamingPlatforms'];
  saving: boolean;
  onSave: (platforms: MusicData['streamingPlatforms']) => void;
}) {
  const [formData, setFormData] = useState(platforms);

  function updatePlatform(index: number, field: string, value: string) {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
      <h3 className="font-bold text-[#f5f5f0] mb-6">Streaming Platform Links</h3>
      <div className="space-y-4">
        {formData.map((platform, index) => (
          <div key={platform.name} className="flex items-center gap-4">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: platform.color }}
            />
            <span className="w-32 text-[#f5f5f0] font-medium">{platform.name}</span>
            <input
              type="url"
              value={platform.url}
              onChange={(e) => updatePlatform(index, 'url', e.target.value)}
              placeholder={`${platform.name} URL`}
              className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => onSave(formData)}
          disabled={saving}
          className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Platforms'}
        </button>
      </div>
    </div>
  );
}

function ReleaseModal({
  release,
  isCreating,
  saving,
  onSave,
  onClose,
}: {
  release: Release;
  isCreating: boolean;
  saving: boolean;
  onSave: (release: Partial<Release>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(release);
  const [uploading, setUploading] = useState(false);

  function updateField(field: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function updateTrack(index: number, field: string, value: string) {
    const tracks = [...formData.tracks];
    tracks[index] = { ...tracks[index], [field]: value };
    setFormData((prev) => ({ ...prev, tracks }));
  }

  function addTrack() {
    setFormData((prev) => ({
      ...prev,
      tracks: [...prev.tracks, { title: '', duration: '' }],
    }));
  }

  function removeTrack(index: number) {
    setFormData((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index),
    }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('file', file);
    form.append('folder', 'media');

    try {
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
      if (res.ok) {
        const { url } = await res.json();
        updateField('coverArt', url);
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-[#f5f5f0]">
            {isCreating ? 'Drop a New Banger' : 'Fix Up This Ripper'}
          </h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f5f0]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              >
                <option value="single">Single</option>
                <option value="ep">EP</option>
                <option value="album">Album</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Release Date</label>
              <input
                type="date"
                value={formData.releaseDate}
                onChange={(e) => updateField('releaseDate', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
          </div>

          {/* Cover Art */}
          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Cover Art</label>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 bg-[#252525] rounded-lg overflow-hidden flex items-center justify-center">
                {formData.coverArt ? (
                  <img src={formData.coverArt} alt="" className="w-full h-full object-cover" />
                ) : (
                  <MusicalNoteIcon className="w-12 h-12 text-[#666]" />
                )}
              </div>
              <label className="px-4 py-2 border border-[#333] rounded-lg text-[#888888] hover:text-[#f5f5f0] hover:border-[#c41e3a] cursor-pointer transition-colors">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
          </div>

          {/* Tracks */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#f5f5f0]">Tracks</label>
              <button onClick={addTrack} className="text-sm text-[#c41e3a] hover:text-[#e63946]">
                + Add Track
              </button>
            </div>
            <div className="space-y-2">
              {formData.tracks.map((track, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-[#888888] w-6 text-right">{index + 1}.</span>
                  <input
                    type="text"
                    value={track.title}
                    onChange={(e) => updateTrack(index, 'title', e.target.value)}
                    placeholder="Track title"
                    className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
                  />
                  <input
                    type="text"
                    value={track.duration}
                    onChange={(e) => updateTrack(index, 'duration', e.target.value)}
                    placeholder="3:45"
                    className="w-20 bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-2 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
                  />
                  {formData.tracks.length > 1 && (
                    <button
                      onClick={() => removeTrack(index)}
                      className="text-[#888888] hover:text-[#c41e3a]"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  )}
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

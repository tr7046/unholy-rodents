'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MusicalNoteIcon,
  ArrowUpTrayIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PlayIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { PageHeader } from '../components/QuickNav';

interface Track {
  title: string;
  duration: string;
  audioUrl?: string;
  lyrics?: string;
}

interface Release {
  id: string;
  title: string;
  type: 'album' | 'ep' | 'single';
  releaseDate: string;
  coverArt: string;
  tracks: Track[];
  streamingLinks: { platform: string; url: string }[];
  slug?: string;
  visibility?: 'public' | 'unlisted' | 'private';
  password?: string;
}

interface MusicData {
  releases: Release[];
  streamingPlatforms: { name: string; url: string; color: string }[];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const defaultRelease: Omit<Release, 'id'> = {
  title: '',
  type: 'single',
  releaseDate: '',
  coverArt: '',
  tracks: [{ title: '', duration: '', audioUrl: '', lyrics: '' }],
  streamingLinks: [],
  slug: '',
  visibility: 'public',
  password: '',
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
                  <div className="aspect-square bg-[#252525] flex items-center justify-center relative">
                    {release.coverArt ? (
                      <img
                        src={release.coverArt}
                        alt={release.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MusicalNoteIcon className="w-16 h-16 text-[#666]" />
                    )}
                    {/* Visibility badge */}
                    <div className="absolute top-2 right-2">
                      {release.visibility === 'unlisted' && (
                        <span className="px-2 py-1 bg-yellow-600/80 text-white text-xs rounded-full flex items-center gap-1">
                          <EyeSlashIcon className="w-3 h-3" /> Unlisted
                        </span>
                      )}
                      {release.visibility === 'private' && (
                        <span className="px-2 py-1 bg-red-600/80 text-white text-xs rounded-full flex items-center gap-1">
                          <LockClosedIcon className="w-3 h-3" /> Private
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-[#f5f5f0]">{release.title}</h3>
                        <p className="text-sm text-[#888888] capitalize">
                          {release.type} - {release.tracks.length} tracks
                        </p>
                        {release.slug && (
                          <p className="text-xs text-[#666] mt-1 font-mono">/{release.slug}</p>
                        )}
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
  const [formData, setFormData] = useState<Release>(() => ({
    ...release,
    slug: release.slug || generateSlug(release.title),
    visibility: release.visibility || 'public',
    password: release.password || '',
    tracks: release.tracks.map((t) => ({
      ...t,
      audioUrl: t.audioUrl || '',
      lyrics: t.lyrics || '',
    })),
  }));
  const [uploading, setUploading] = useState(false);
  const [uploadingTrack, setUploadingTrack] = useState<number | null>(null);
  const [expandedLyrics, setExpandedLyrics] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  function updateField(field: string, value: unknown) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-generate slug from title if slug hasn't been manually edited
      if (field === 'title' && (!prev.slug || prev.slug === generateSlug(prev.title))) {
        updated.slug = generateSlug(value as string);
      }
      return updated;
    });
  }

  function updateTrack(index: number, field: string, value: string) {
    const tracks = [...formData.tracks];
    tracks[index] = { ...tracks[index], [field]: value };
    setFormData((prev) => ({ ...prev, tracks }));
  }

  function addTrack() {
    setFormData((prev) => ({
      ...prev,
      tracks: [...prev.tracks, { title: '', duration: '', audioUrl: '', lyrics: '' }],
    }));
  }

  function removeTrack(index: number) {
    setFormData((prev) => ({
      ...prev,
      tracks: prev.tracks.filter((_, i) => i !== index),
    }));
    if (expandedLyrics === index) setExpandedLyrics(null);
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

  async function handleAudioUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('Audio file must be under 50MB');
      return;
    }

    setUploadingTrack(index);

    try {
      // Get signed upload params (bypasses Vercel 4.5MB body limit)
      const sigRes = await fetch('/api/admin/upload?folder=music');
      if (!sigRes.ok) {
        alert('Failed to get upload signature');
        return;
      }
      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      // Upload directly to Cloudinary from browser
      const form = new FormData();
      form.append('file', file);
      form.append('folder', folder);
      form.append('signature', signature);
      form.append('timestamp', timestamp.toString());
      form.append('api_key', apiKey);
      form.append('resource_type', 'video'); // Cloudinary uses 'video' for audio

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: form }
      );

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        updateTrack(index, 'audioUrl', data.secure_url);
      } else {
        alert('Upload failed');
      }
    } finally {
      setUploadingTrack(null);
    }
  }

  function copyPrivateLink() {
    const origin = window.location.origin;
    const link = `${origin}/releases/${formData.slug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
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
          {/* Title, Type, Date */}
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

          {/* Slug & Visibility */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">URL Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-[#888888] text-sm">/releases/</span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  className="flex-1 bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-3 text-[#f5f5f0] font-mono text-sm focus:outline-none focus:border-[#c41e3a]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Visibility</label>
              <select
                value={formData.visibility}
                onChange={(e) => updateField('visibility', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              >
                <option value="public">Public - Listed on music page</option>
                <option value="unlisted">Unlisted - Direct link only</option>
                <option value="private">Private - Password protected</option>
              </select>
            </div>
          </div>

          {/* Password (for private) */}
          {formData.visibility === 'private' && (
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Access Password</label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                placeholder="Enter a password for access"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>
          )}

          {/* Private link copy */}
          {formData.slug && formData.visibility !== 'public' && (
            <div className="flex items-center gap-3 bg-[#252525] rounded-lg px-4 py-3">
              <span className="text-sm text-[#888888] flex-1 font-mono truncate">
                {typeof window !== 'undefined' ? window.location.origin : ''}/releases/{formData.slug}
              </span>
              <button
                onClick={copyPrivateLink}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-[#333] hover:bg-[#444] rounded text-[#f5f5f0] transition-colors"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-4 h-4 text-green-400" /> Copied
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="w-4 h-4" /> Copy Link
                  </>
                )}
              </button>
            </div>
          )}

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
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[#f5f5f0]">Tracks</label>
              <button onClick={addTrack} className="text-sm text-[#c41e3a] hover:text-[#e63946]">
                + Add Track
              </button>
            </div>
            <div className="space-y-4">
              {formData.tracks.map((track, index) => (
                <div key={index} className="bg-[#0a0a0a] border border-[#333] rounded-lg p-4">
                  {/* Track header row */}
                  <div className="flex items-center gap-3">
                    <span className="text-[#888888] w-6 text-right text-sm">{index + 1}.</span>
                    <input
                      type="text"
                      value={track.title}
                      onChange={(e) => updateTrack(index, 'title', e.target.value)}
                      placeholder="Track title"
                      className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-[#f5f5f0] text-sm focus:outline-none focus:border-[#c41e3a]"
                    />
                    <input
                      type="text"
                      value={track.duration}
                      onChange={(e) => updateTrack(index, 'duration', e.target.value)}
                      placeholder="3:45"
                      className="w-20 bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-[#f5f5f0] text-sm focus:outline-none focus:border-[#c41e3a]"
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

                  {/* Audio upload row */}
                  <div className="flex items-center gap-3 mt-3 ml-9">
                    {track.audioUrl ? (
                      <div className="flex items-center gap-2 flex-1">
                        <PlayIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-xs text-green-400 truncate flex-1">Audio uploaded</span>
                        <button
                          onClick={() => updateTrack(index, 'audioUrl', '')}
                          className="text-xs text-[#888888] hover:text-[#c41e3a]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-[#444] rounded-lg text-[#888888] hover:text-[#f5f5f0] hover:border-[#c41e3a] cursor-pointer transition-colors text-xs">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioUpload(index, e)}
                          className="hidden"
                        />
                        <ArrowUpTrayIcon className="w-4 h-4" />
                        {uploadingTrack === index ? 'Uploading...' : 'Upload Audio'}
                      </label>
                    )}

                    {/* Lyrics toggle */}
                    <button
                      onClick={() => setExpandedLyrics(expandedLyrics === index ? null : index)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        expandedLyrics === index
                          ? 'bg-[#c41e3a]/20 text-[#c41e3a]'
                          : track.lyrics
                          ? 'text-[#c41e3a] hover:bg-[#c41e3a]/10'
                          : 'text-[#888888] hover:text-[#f5f5f0]'
                      }`}
                    >
                      {expandedLyrics === index ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )}
                      Lyrics{track.lyrics ? ' *' : ''}
                    </button>
                  </div>

                  {/* Lyrics textarea (expandable) */}
                  {expandedLyrics === index && (
                    <div className="mt-3 ml-9">
                      <textarea
                        value={track.lyrics || ''}
                        onChange={(e) => updateTrack(index, 'lyrics', e.target.value)}
                        placeholder="Paste lyrics here..."
                        rows={8}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-[#f5f5f0] text-sm focus:outline-none focus:border-[#c41e3a] resize-y font-mono"
                      />
                    </div>
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

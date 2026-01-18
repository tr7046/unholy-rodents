'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  createdAt: string;
}

interface MediaData {
  photos: MediaItem[];
  videos: MediaItem[];
  flyers: MediaItem[];
}

type MediaType = 'photos' | 'videos' | 'flyers';

export default function MediaAdminPage() {
  const [data, setData] = useState<MediaData | null>(null);
  const [activeTab, setActiveTab] = useState<MediaType>('photos');
  const [uploading, setUploading] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/admin/media');
    if (res.ok) {
      setData(await res.json());
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: MediaType) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'media');

        const uploadRes = await fetch('/api/admin/upload', { method: 'POST', body: form });
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          await fetch('/api/admin/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              item: { url, title: file.name.replace(/\.[^/.]+$/, '') },
              type,
            }),
          });
        }
      }
      await fetchData();
    } finally {
      setUploading(false);
    }
  }

  async function handleAddVideo(url: string, title: string) {
    await fetch('/api/admin/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        item: { url, title },
        type: 'videos',
      }),
    });
    await fetchData();
    setShowAddVideo(false);
  }

  async function handleDelete(id: string, type: MediaType) {
    if (!confirm('Chuck this in the bin ya reckon?')) return;

    await fetch(`/api/admin/media?id=${id}&type=${type}`, { method: 'DELETE' });
    await fetchData();
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  const items = data[activeTab];
  const Icon = activeTab === 'photos' ? PhotoIcon : activeTab === 'videos' ? VideoCameraIcon : DocumentIcon;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#f5f5f0]">Media</h1>
          <p className="text-[#888888] mt-1">
            {data.photos.length} photos, {data.videos.length} videos, {data.flyers.length} flyers
          </p>
        </div>
        {activeTab === 'videos' ? (
          <button
            onClick={() => setShowAddVideo(true)}
            className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Chuck Up a Video
          </button>
        ) : (
          <label className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg cursor-pointer transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleUpload(e, activeTab)}
              className="hidden"
            />
            <PlusIcon className="w-5 h-5" />
            {uploading ? 'Uploading...' : `Upload ${activeTab === 'photos' ? 'Some Pics' : 'Flyers'} Ya Galah`}
          </label>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {(['photos', 'videos', 'flyers'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-[#c41e3a] text-white'
                : 'bg-[#1a1a1a] text-[#888888] hover:text-[#f5f5f0]'
            }`}
          >
            {tab} ({data[tab].length})
          </button>
        ))}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-12 text-center">
          <Icon className="w-12 h-12 text-[#666] mx-auto mb-4" />
          <p className="text-[#888888]">No {activeTab} yet ya cunt. Get snappin!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden"
            >
              {activeTab === 'videos' ? (
                <div className="aspect-video bg-[#252525] flex items-center justify-center">
                  {item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                    <iframe
                      src={getYouTubeEmbedUrl(item.url)}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <VideoCameraIcon className="w-12 h-12 text-[#666]" />
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-[#252525]">
                  <img
                    src={item.url}
                    alt={item.title || ''}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(item.id, activeTab)}
                  className="p-3 bg-[#c41e3a] rounded-full text-white hover:bg-[#a01830] transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              {item.title && (
                <div className="p-3">
                  <p className="text-sm text-[#f5f5f0] truncate">{item.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideo && (
        <AddVideoModal
          onAdd={handleAddVideo}
          onClose={() => setShowAddVideo(false)}
        />
      )}
    </div>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
}

function AddVideoModal({
  onAdd,
  onClose,
}: {
  onAdd: (url: string, title: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-xl font-bold text-[#f5f5f0]">Chuck Up a Video Ya Legend</h2>
          <button onClick={onClose} className="text-[#888888] hover:text-[#f5f5f0]">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Video URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Video title"
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 p-6 border-t border-[#333]">
          <button onClick={onClose} className="px-4 py-2 text-[#888888] hover:text-[#f5f5f0]">
            Cancel
          </button>
          <button
            onClick={() => onAdd(url, title)}
            disabled={!url}
            className="px-6 py-2 bg-[#c41e3a] hover:bg-[#a01830] text-white rounded-lg disabled:opacity-50"
          >
            Add Video
          </button>
        </div>
      </div>
    </div>
  );
}

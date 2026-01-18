'use client';

import { useState, useEffect } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface HomepageData {
  hero: {
    title: string;
    tagline: string[];
    marqueeText: string;
  };
  featuredShow: {
    enabled: boolean;
    showId: string | null;
  };
  featuredRelease: {
    enabled: boolean;
    releaseId: string | null;
    placeholderText: string;
  };
}

export default function HomepageAdminPage() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch('/api/admin/homepage');
    if (res.ok) {
      setData(await res.json());
    }
  }

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setSaved(false);

    try {
      await fetch('/api/admin/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function updateHero(field: string, value: unknown) {
    setData((prev) => prev ? { ...prev, hero: { ...prev.hero, [field]: value } } : null);
  }

  function updateFeaturedShow(field: string, value: unknown) {
    setData((prev) => prev ? { ...prev, featuredShow: { ...prev.featuredShow, [field]: value } } : null);
  }

  function updateFeaturedRelease(field: string, value: unknown) {
    setData((prev) => prev ? { ...prev, featuredRelease: { ...prev.featuredRelease, [field]: value } } : null);
  }

  if (!data) {
    return <div className="text-[#888888]">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#f5f5f0]">Homepage</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-[#c41e3a] hover:bg-[#a01830] text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saved ? (
            <>
              <CheckIcon className="w-5 h-5" />
              Saved
            </>
          ) : saving ? (
            'Saving...'
          ) : (
            'Save Changes'
          )}
        </button>
      </div>

      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#f5f5f0] mb-6">Hero Section</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Title</label>
              <input
                type="text"
                value={data.hero.title}
                onChange={(e) => updateHero('title', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Tagline (one per line)</label>
              <textarea
                value={data.hero.tagline.join('\n')}
                onChange={(e) => updateHero('tagline', e.target.value.split('\n'))}
                rows={2}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#f5f5f0] mb-2">Marquee Text</label>
              <input
                type="text"
                value={data.hero.marqueeText}
                onChange={(e) => updateHero('marqueeText', e.target.value)}
                placeholder="HAIL SQUATAN /// FUCK ANIMAL CONTROL /// STAY NUTS"
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
              />
              <p className="text-xs text-[#888888] mt-1">Use /// to separate phrases</p>
            </div>
          </div>
        </div>

        {/* Featured Show */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#f5f5f0] mb-6">Featured Show Section</h2>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="showEnabled"
              checked={data.featuredShow.enabled}
              onChange={(e) => updateFeaturedShow('enabled', e.target.checked)}
              className="w-5 h-5 rounded border-[#333] bg-[#0a0a0a] text-[#c41e3a] focus:ring-[#c41e3a]"
            />
            <label htmlFor="showEnabled" className="text-[#f5f5f0]">
              Show featured show section
            </label>
          </div>

          <p className="text-sm text-[#888888]">
            When enabled, displays the next upcoming show from your shows list.
            Add shows in the Shows section.
          </p>
        </div>

        {/* Featured Release */}
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
          <h2 className="text-lg font-bold text-[#f5f5f0] mb-6">Featured Release Section</h2>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="releaseEnabled"
              checked={data.featuredRelease.enabled}
              onChange={(e) => updateFeaturedRelease('enabled', e.target.checked)}
              className="w-5 h-5 rounded border-[#333] bg-[#0a0a0a] text-[#c41e3a] focus:ring-[#c41e3a]"
            />
            <label htmlFor="releaseEnabled" className="text-[#f5f5f0]">
              Show featured release section
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-[#f5f5f0] mb-2">
              Placeholder Text (shown when no releases)
            </label>
            <input
              type="text"
              value={data.featuredRelease.placeholderText}
              onChange={(e) => updateFeaturedRelease('placeholderText', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-[#f5f5f0] focus:outline-none focus:border-[#c41e3a]"
            />
          </div>

          <p className="text-sm text-[#888888] mt-4">
            When enabled and you have releases, displays the latest release.
            Add releases in the Music section.
          </p>
        </div>
      </div>
    </div>
  );
}

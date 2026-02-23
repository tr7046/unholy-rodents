'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '../components/QuickNav';
import {
  EyeIcon,
  MusicalNoteIcon,
  UserGroupIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface OverviewData {
  totalPageViews: number;
  totalPlays: number;
  recentPageViews: number;
  recentPlays: number;
  uniqueVisitors: number;
  period: number;
}

interface DailyData {
  date: string;
  views?: number;
  plays?: number;
}

interface PageViewsData {
  daily: DailyData[];
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
}

interface PlaysData {
  daily: DailyData[];
  topTracks: { trackId: string; trackName: string; plays: number }[];
  topReleases: { releaseId: string; releaseName: string; plays: number }[];
  totalPlays: number;
}

interface RealtimeData {
  activeVisitors: number;
  lastHourViews: number;
  lastHourPlays: number;
  recentPlays: { trackName: string; releaseName: string; createdAt: string }[];
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

// Simple bar chart component
function BarChart({ data, valueKey, maxBars = 30 }: { data: DailyData[]; valueKey: 'views' | 'plays'; maxBars?: number }) {
  const sliced = data.slice(-maxBars);
  const max = Math.max(...sliced.map((d) => (d[valueKey] as number) || 0), 1);

  if (sliced.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-[#666] text-sm">
        No data yet
      </div>
    );
  }

  return (
    <div className="h-40 flex items-end gap-[2px]">
      {sliced.map((d, i) => {
        const val = (d[valueKey] as number) || 0;
        const pct = (val / max) * 100;
        const dateLabel = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return (
          <div
            key={i}
            className="flex-1 min-w-[4px] group relative"
            title={`${dateLabel}: ${val}`}
          >
            <div
              className="bg-[#c41e3a] hover:bg-[#e63946] transition-colors rounded-t-sm w-full"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-[#0a0a0a] border border-[#333] rounded px-2 py-1 text-xs text-[#f5f5f0] whitespace-nowrap">
                <div className="font-medium">{val.toLocaleString()}</div>
                <div className="text-[#888888]">{dateLabel}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState(30);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [pageViews, setPageViews] = useState<PageViewsData | null>(null);
  const [plays, setPlays] = useState<PlaysData | null>(null);
  const [realtime, setRealtime] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'music'>('overview');

  useEffect(() => {
    fetchAllData();
  }, [period]);

  // Refresh realtime data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSection('realtime');
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchSection(section: string) {
    try {
      const res = await fetch(`/api/admin/analytics?section=${section}&days=${period}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  }

  async function fetchAllData() {
    setLoading(true);
    const [overviewData, pageViewData, playsData, realtimeData] = await Promise.all([
      fetchSection('overview'),
      fetchSection('pageviews'),
      fetchSection('plays'),
      fetchSection('realtime'),
    ]);
    setOverview(overviewData);
    setPageViews(pageViewData);
    setPlays(playsData);
    setRealtime(realtimeData);
    setLoading(false);
  }

  const periods = [
    { label: '7d', value: 7 },
    { label: '30d', value: 30 },
    { label: '90d', value: 90 },
  ];

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Analytics"
          subtitle="Site traffic and music engagement"
          current="dashboard"
          related={['music']}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-[#888888]">Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Site traffic and music engagement"
        current="dashboard"
        related={['music']}
        action={
          <div className="flex items-center gap-2">
            {periods.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  period === p.value
                    ? 'bg-[#c41e3a] text-white'
                    : 'bg-[#1a1a1a] text-[#888888] hover:text-[#f5f5f0] border border-[#333]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Realtime Banner */}
      {realtime && (
        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 mb-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-[#f5f5f0] font-medium">
              {realtime.activeVisitors} active now
            </span>
          </div>
          <div className="text-sm text-[#888888]">
            Last hour: {realtime.lastHourViews} views &middot; {realtime.lastHourPlays} plays
          </div>
          {realtime.recentPlays.length > 0 && (
            <div className="text-sm text-[#888888]">
              Latest: <span className="text-[#c41e3a]">{realtime.recentPlays[0].trackName}</span>
              {' '}{timeAgo(realtime.recentPlays[0].createdAt)}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-[#1a1a1a] rounded-lg p-1 w-fit border border-[#333]">
        {[
          { key: 'overview' as const, label: 'Overview', icon: ChartBarIcon },
          { key: 'traffic' as const, label: 'Traffic', icon: EyeIcon },
          { key: 'music' as const, label: 'Music', icon: MusicalNoteIcon },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === tab.key
                ? 'bg-[#c41e3a] text-white'
                : 'text-[#888888] hover:text-[#f5f5f0]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={EyeIcon}
              label="Page Views"
              value={formatNumber(overview?.recentPageViews || 0)}
              sublabel={`${period}d`}
            />
            <StatCard
              icon={MusicalNoteIcon}
              label="Track Plays"
              value={formatNumber(overview?.recentPlays || 0)}
              sublabel={`${period}d`}
            />
            <StatCard
              icon={UserGroupIcon}
              label="Unique Visitors"
              value={formatNumber(overview?.uniqueVisitors || 0)}
              sublabel={`${period}d`}
            />
            <StatCard
              icon={ArrowTrendingUpIcon}
              label="All-Time Views"
              value={formatNumber(overview?.totalPageViews || 0)}
              sublabel="total"
            />
            <StatCard
              icon={ClockIcon}
              label="All-Time Plays"
              value={formatNumber(overview?.totalPlays || 0)}
              sublabel="total"
            />
          </div>

          {/* Charts Side by Side */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <h3 className="text-sm font-medium text-[#f5f5f0] mb-4">Page Views ({period}d)</h3>
              <BarChart data={pageViews?.daily || []} valueKey="views" />
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <h3 className="text-sm font-medium text-[#f5f5f0] mb-4">Track Plays ({period}d)</h3>
              <BarChart data={plays?.daily || []} valueKey="plays" />
            </div>
          </div>

          {/* Top Tracks + Top Pages */}
          <div className="grid lg:grid-cols-2 gap-6">
            <ListCard
              title="Top Tracks"
              items={(plays?.topTracks || []).slice(0, 10).map((t) => ({
                label: t.trackName,
                value: t.plays,
              }))}
              emptyText="No plays yet"
            />
            <ListCard
              title="Top Pages"
              items={(pageViews?.topPages || []).slice(0, 10).map((p) => ({
                label: p.path,
                value: p.views,
              }))}
              emptyText="No page views yet"
            />
          </div>
        </div>
      )}

      {/* Traffic Tab */}
      {activeTab === 'traffic' && (
        <div className="space-y-6">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <h3 className="text-sm font-medium text-[#f5f5f0] mb-4">Daily Page Views ({period}d)</h3>
            <BarChart data={pageViews?.daily || []} valueKey="views" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ListCard
              title="Top Pages"
              items={(pageViews?.topPages || []).map((p) => ({
                label: p.path,
                value: p.views,
              }))}
              emptyText="No page views yet"
            />
            <ListCard
              title="Top Referrers"
              items={(pageViews?.topReferrers || []).map((r) => ({
                label: r.referrer || 'Direct',
                value: r.views,
              }))}
              emptyText="No referrer data yet"
            />
          </div>
        </div>
      )}

      {/* Music Tab */}
      {activeTab === 'music' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              icon={MusicalNoteIcon}
              label="Total Plays"
              value={formatNumber(plays?.totalPlays || 0)}
              sublabel="all time"
            />
            <StatCard
              icon={ArrowTrendingUpIcon}
              label="Recent Plays"
              value={formatNumber(overview?.recentPlays || 0)}
              sublabel={`${period}d`}
            />
            <StatCard
              icon={ClockIcon}
              label="Top Tracks"
              value={String(plays?.topTracks?.length || 0)}
              sublabel="unique tracks"
            />
          </div>

          <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
            <h3 className="text-sm font-medium text-[#f5f5f0] mb-4">Daily Listens ({period}d)</h3>
            <BarChart data={plays?.daily || []} valueKey="plays" />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <ListCard
              title="Most Played Tracks"
              items={(plays?.topTracks || []).map((t) => ({
                label: t.trackName,
                value: t.plays,
              }))}
              emptyText="No plays yet"
            />
            <ListCard
              title="Most Played Releases"
              items={(plays?.topReleases || []).map((r) => ({
                label: r.releaseName || 'Unknown',
                value: r.plays,
              }))}
              emptyText="No plays yet"
            />
          </div>

          {/* Recent Plays Activity */}
          {realtime && realtime.recentPlays.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
              <h3 className="text-sm font-medium text-[#f5f5f0] mb-4">Recent Listens</h3>
              <div className="space-y-3">
                {realtime.recentPlays.map((play, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <MusicalNoteIcon className="w-4 h-4 text-[#c41e3a] flex-shrink-0" />
                    <span className="text-[#f5f5f0] truncate flex-1">{play.trackName}</span>
                    {play.releaseName && (
                      <span className="text-[#666] truncate hidden sm:block">{play.releaseName}</span>
                    )}
                    <span className="text-[#666] text-xs flex-shrink-0">{timeAgo(play.createdAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sublabel }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-[#c41e3a]" />
        <span className="text-xs text-[#888888] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-[#f5f5f0]">{value}</div>
      <div className="text-xs text-[#666] mt-1">{sublabel}</div>
    </div>
  );
}

function ListCard({ title, items, emptyText }: {
  title: string;
  items: { label: string; value: number }[];
  emptyText: string;
}) {
  const maxValue = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-6">
      <h3 className="text-sm font-medium text-[#f5f5f0] mb-4">{title}</h3>
      {items.length === 0 ? (
        <div className="text-[#666] text-sm text-center py-6">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-[#666] w-5 text-right">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm text-[#f5f5f0] truncate">{item.label}</span>
                  <span className="text-sm text-[#888888] tabular-nums flex-shrink-0">{item.value.toLocaleString()}</span>
                </div>
                <div className="h-1 bg-[#252525] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#c41e3a] rounded-full"
                    style={{ width: `${(item.value / maxValue) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

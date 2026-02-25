'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, ExternalLink, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import {
  FadeUp,
  NoiseOverlay,
} from '@/components/animations';
import { playAlbum, playTrack, type PlayerTrack } from '@/components/AudioPlayer';

interface Track {
  id?: string;
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
  visibility?: string;
  requiresPassword?: boolean;
}

export default function ReleasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [release, setRelease] = useState<Release | null>(null);
  const [platforms, setPlatforms] = useState<{ name: string; url: string; color: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [expandedLyrics, setExpandedLyrics] = useState<number | null>(null);
  const [playCounts, setPlayCounts] = useState<{ tracks: Record<string, number>; releases: Record<string, number> }>({ tracks: {}, releases: {} });

  useEffect(() => {
    fetchRelease();
    fetch('/api/public/analytics')
      .then(res => res.json())
      .then(setPlayCounts)
      .catch(() => {});
  }, [slug]);

  async function fetchRelease(pw?: string) {
    try {
      let url = `/api/public/music/releases?slug=${slug}`;
      if (pw) url += `&password=${encodeURIComponent(pw)}`;

      const res = await fetch(url);
      if (!res.ok) {
        setNotFound(true);
        return;
      }

      const data = await res.json();
      if (data.release?.requiresPassword) {
        setRequiresPassword(true);
        setRelease(data.release);
        setPlatforms(data.streamingPlatforms || []);
      } else {
        setRequiresPassword(false);
        setRelease(data.release);
        setPlatforms(data.streamingPlatforms || []);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(false);
    setLoading(true);
    fetchRelease(password).then(() => {
      if (requiresPassword) {
        setPasswordError(true);
      }
    });
  }

  function handlePlayTrack(track: Track, index: number) {
    if (!track.audioUrl || !release) return;

    const playableTracks: PlayerTrack[] = release.tracks
      .filter((t) => t.audioUrl)
      .map((t) => ({
        title: t.title,
        audioUrl: t.audioUrl!,
        duration: t.duration,
        releaseTitle: release.title,
        coverArt: release.coverArt,
        trackId: t.id,
        releaseId: release.id,
      }));

    // Find the index in the playable list
    const playableIndex = release.tracks
      .filter((t) => t.audioUrl)
      .findIndex((_, i, arr) => {
        // Map back to original index
        let count = 0;
        for (let j = 0; j < release.tracks.length; j++) {
          if (release.tracks[j].audioUrl) {
            if (count === i) return j === index;
            count++;
          }
        }
        return false;
      });

    if (playableTracks.length > 1) {
      playAlbum(playableTracks, Math.max(0, playableIndex));
    } else if (playableTracks.length === 1) {
      playTrack(playableTracks[0]);
    }
  }

  function handlePlayAll() {
    if (!release) return;
    const playableTracks: PlayerTrack[] = release.tracks
      .filter((t) => t.audioUrl)
      .map((t) => ({
        title: t.title,
        audioUrl: t.audioUrl!,
        duration: t.duration,
        releaseTitle: release.title,
        coverArt: release.coverArt,
        trackId: t.id,
        releaseId: release.id,
      }));

    if (playableTracks.length > 0) {
      playAlbum(playableTracks, 0);
    }
  }

  if (loading) {
    return (
      <div className="relative pt-20 min-h-screen bg-void flex items-center justify-center">
        <div className="text-concrete">Loading...</div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="relative pt-20 min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-blood mx-auto mb-4" />
          <h2 className="text-2xl font-display text-paper mb-2">RELEASE NOT FOUND</h2>
          <p className="text-concrete mb-6">This release doesn&apos;t exist or has been removed.</p>
          <Link href="/music" className="btn btn-primary">
            Back to Music
          </Link>
        </div>
      </div>
    );
  }

  // Password gate
  if (requiresPassword) {
    return (
      <div className="relative pt-20 min-h-screen bg-void flex items-center justify-center">
        <NoiseOverlay />
        <div className="card max-w-md w-full mx-4 text-center p-8">
          <Lock className="w-12 h-12 text-blood mx-auto mb-4" />
          <h2 className="text-2xl font-display text-paper mb-2">PRIVATE RELEASE</h2>
          <p className="text-concrete mb-6">This release requires a password to access.</p>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-void border border-[#333] rounded-lg px-4 py-3 text-paper focus:outline-none focus:border-blood text-center"
            />
            {passwordError && (
              <p className="text-blood text-sm">Wrong password. Try again.</p>
            )}
            <button type="submit" className="btn btn-primary w-full">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!release) return null;

  const hasPlayableTracks = release.tracks.some((t) => t.audioUrl);
  const releaseDate = release.releaseDate
    ? new Date(release.releaseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="relative pt-20">
      <NoiseOverlay />

      {/* Hero */}
      <section className="pt-12 pb-8 bg-void relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blood/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <FadeUp>
            <Link href="/music" className="text-blood hover:text-[#e63946] text-sm font-medium mb-6 inline-block">
              &larr; Back to Music
            </Link>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Cover Art */}
            <FadeUp>
              <div className="relative">
                <motion.div
                  className="aspect-square bg-charcoal border-4 border-blood flex items-center justify-center overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {release.coverArt ? (
                    <img src={release.coverArt} alt={release.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-32 h-32 text-blood" />
                  )}
                </motion.div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blood" />
              </div>
            </FadeUp>

            {/* Info */}
            <FadeUp delay={0.1}>
              <div>
                <span className="tag mb-4 inline-block">{release.type.toUpperCase()}</span>
                <h1 className="text-4xl md:text-5xl font-display text-paper mb-3 break-words">{release.title}</h1>
                {releaseDate && (
                  <p className="text-concrete mb-6">{releaseDate}</p>
                )}

                {/* Play all button */}
                {hasPlayableTracks && (
                  <motion.button
                    onClick={handlePlayAll}
                    className="flex items-center gap-3 bg-blood hover:bg-[#e63946] text-paper px-8 py-4 font-display uppercase tracking-wider mb-8 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Play className="w-5 h-5" />
                    Play All
                  </motion.button>
                )}

                {/* Streaming links */}
                {release.streamingLinks && release.streamingLinks.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {release.streamingLinks.map((link) => {
                      const platform = platforms.find((p) => p.name === link.platform);
                      return (
                        <motion.a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 text-paper font-display uppercase tracking-wider text-sm inline-flex items-center gap-2"
                          style={{ backgroundColor: platform?.color || '#333' }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {link.platform}
                          <ExternalLink className="w-3 h-3" />
                        </motion.a>
                      );
                    })}
                  </div>
                )}

                {/* Track count + plays */}
                <p className="text-concrete text-sm">
                  {release.tracks.length} {release.tracks.length === 1 ? 'track' : 'tracks'}
                  {release.id && (playCounts.releases[release.id] || 0) > 0 && (
                    <span className="ml-2 text-concrete/60">&middot; {playCounts.releases[release.id].toLocaleString()} plays</span>
                  )}
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Tracklist */}
      <section className="py-12 bg-charcoal">
        <div className="container mx-auto px-4">
          <FadeUp>
            <h2 className="text-paper mb-8">TRACKLIST</h2>
          </FadeUp>

          <div className="space-y-1">
            {release.tracks.map((track, index) => (
              <FadeUp key={index} delay={index * 0.05}>
                <div>
                  <div
                    className={`flex items-center gap-4 py-4 px-4 rounded-lg transition-colors ${
                      track.audioUrl
                        ? 'hover:bg-void/50 cursor-pointer group'
                        : ''
                    }`}
                    onClick={() => handlePlayTrack(track, index)}
                  >
                    {/* Track number / play icon */}
                    <div className="w-8 text-center">
                      {track.audioUrl ? (
                        <>
                          <span className="text-concrete group-hover:hidden">{index + 1}</span>
                          <Play className="w-4 h-4 text-blood hidden group-hover:block mx-auto" />
                        </>
                      ) : (
                        <span className="text-concrete">{index + 1}</span>
                      )}
                    </div>

                    {/* Title */}
                    <span className="flex-1 text-paper font-medium">{track.title}</span>

                    {/* Lyrics button */}
                    {track.lyrics && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedLyrics(expandedLyrics === index ? null : index);
                        }}
                        className="flex items-center gap-1 text-xs text-blood hover:text-[#e63946] transition-colors px-2 py-1"
                      >
                        {expandedLyrics === index ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                        Lyrics
                      </button>
                    )}

                    {/* Play count */}
                    {(() => {
                      const key = track.id || track.audioUrl;
                      const count = key ? playCounts.tracks[key] || 0 : 0;
                      return count > 0 ? (
                        <span className="text-concrete/50 text-xs tabular-nums">{count.toLocaleString()}</span>
                      ) : null;
                    })()}

                    {/* Duration */}
                    <span className="text-concrete text-sm">{track.duration}</span>
                  </div>

                  {/* Expanded lyrics */}
                  {expandedLyrics === index && track.lyrics && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-12 mr-4 mb-4 p-6 bg-void/50 rounded-lg border border-[#333]"
                    >
                      <pre className="text-concrete text-sm whitespace-pre-wrap font-sans leading-relaxed">
                        {track.lyrics}
                      </pre>
                    </motion.div>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

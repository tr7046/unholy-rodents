'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
  QueueListIcon,
} from '@heroicons/react/24/solid';
import { trackPlay } from './Analytics';

export interface PlayerTrack {
  title: string;
  audioUrl: string;
  duration: string;
  releaseTitle: string;
  coverArt: string;
  trackId?: string;
  releaseId?: string;
}

interface AudioPlayerState {
  tracks: PlayerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isVisible: boolean;
}

// ─── Module-level audio engine (singleton, lives outside React) ───

let globalState: AudioPlayerState = {
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  isVisible: false,
};

let globalHowl: Howl | null = null;
let globalVolume = 0.8;
let globalMuted = false;
let globalBuffering = false;
let isAutoAdvancing = false;

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

// Extract audio format from URL so Howler can detect codec support
function getAudioFormat(url: string): string | undefined {
  const match = url.match(/\.(mp3|mp4|m4a|aac|wav|ogg|webm|flac|opus)(?:[?#]|$)/i);
  return match ? match[1].toLowerCase() : undefined;
}

// Transcode lossless Cloudinary URLs to MP3 for streaming (WAV/FLAC are huge)
function getStreamingUrl(url: string): string {
  if (url.includes('res.cloudinary.com') && /\.(wav|flac|aiff?)(?:[?#]|$)/i.test(url)) {
    return url.replace(/\.(wav|flac|aiff?)(?=[?#]|$)/i, '.mp3');
  }
  return url;
}

// Update Media Session metadata for lock screen / notification controls
function updateMediaSession(track: PlayerTrack) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: 'Unholy Rodents',
    album: track.releaseTitle,
    ...(track.coverArt ? { artwork: [{ src: track.coverArt, sizes: '512x512', type: 'image/jpeg' }] } : {}),
  });
  navigator.mediaSession.setActionHandler('play', () => globalHowl?.play());
  navigator.mediaSession.setActionHandler('pause', () => globalHowl?.pause());
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    if (globalState.currentIndex > 0) {
      const idx = globalState.currentIndex - 1;
      const t = globalState.tracks[idx];
      globalState = { ...globalState, currentIndex: idx, isPlaying: true };
      loadAndPlay(t.audioUrl);
      notify();
    }
  });
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    if (globalState.currentIndex < globalState.tracks.length - 1) {
      const idx = globalState.currentIndex + 1;
      const t = globalState.tracks[idx];
      globalState = { ...globalState, currentIndex: idx, isPlaying: true };
      loadAndPlay(t.audioUrl);
      notify();
    }
  });
}

// Get the underlying HTML5 audio element from a Howl instance
function getAudioNode(howl: Howl): HTMLAudioElement | null {
  return (howl as unknown as { _sounds: { _node: HTMLAudioElement }[] })._sounds?.[0]?._node ?? null;
}

// Core: create Howl and play. MUST be called synchronously from user gesture
// handlers so Safari allows the play() call.
function loadAndPlay(url: string) {
  const streamUrl = getStreamingUrl(url);
  const fmt = getAudioFormat(streamUrl);

  // On auto-advance (backgrounded tab), reuse the existing audio element
  // to avoid mobile browser blocking play() on a new element without gesture
  if (isAutoAdvancing && globalHowl) {
    const node = getAudioNode(globalHowl);
    if (node) {
      // Swap source on existing audio element — keeps the media session alive
      node.src = streamUrl;
      node.load();
      const playPromise = node.play();
      if (playPromise) {
        playPromise.catch(() => {
          // If play is blocked, retry when user returns to tab
          const onVisible = () => {
            if (!document.hidden) {
              node.play().catch(() => {});
              document.removeEventListener('visibilitychange', onVisible);
            }
          };
          document.addEventListener('visibilitychange', onVisible);
        });
      }
      isAutoAdvancing = false;
      const currentTrack = globalState.tracks[globalState.currentIndex];
      if (currentTrack) updateMediaSession(currentTrack);
      return;
    }
  }

  if (globalHowl) {
    globalHowl.unload();
  }

  globalHowl = new Howl({
    src: [streamUrl],
    html5: true,
    preload: true,
    volume: globalMuted ? 0 : globalVolume,
    ...(fmt ? { format: [fmt] } : {}),
    onplay: () => {
      globalState = { ...globalState, isPlaying: true };
      globalBuffering = false;
      notify();
    },
    onpause: () => {
      globalState = { ...globalState, isPlaying: false };
      notify();
    },
    onend: () => {
      // Auto-advance to next track
      if (globalState.currentIndex < globalState.tracks.length - 1) {
        const nextIdx = globalState.currentIndex + 1;
        const nextTrack = globalState.tracks[nextIdx];
        globalState = { ...globalState, currentIndex: nextIdx, isPlaying: true };
        isAutoAdvancing = true;
        loadAndPlay(nextTrack.audioUrl);
        trackPlay({
          trackId: nextTrack.trackId || nextTrack.audioUrl,
          trackName: nextTrack.title,
          releaseId: nextTrack.releaseId,
          releaseName: nextTrack.releaseTitle,
        });
        notify();
      } else {
        globalState = { ...globalState, isPlaying: false };
        notify();
      }
    },
    onload: () => {
      globalBuffering = false;
      notify();
    },
    onseek: () => {
      globalBuffering = true;
      notify();
    },
    onloaderror: (_id: number, err: unknown) => {
      console.error('[AudioPlayer] Load error:', err);
      globalState = { ...globalState, isPlaying: false };
      notify();
    },
    onplayerror: () => {
      // Safari autoplay fallback: wait for audio unlock then retry
      if (globalHowl) {
        globalHowl.once('unlock', () => {
          globalHowl?.play();
        });
      }
    },
  });

  globalHowl.play();

  // Hook into HTML5 audio element for buffering detection
  const sound = getAudioNode(globalHowl);
  if (sound) {
    sound.addEventListener('waiting', () => { globalBuffering = true; notify(); });
    sound.addEventListener('playing', () => { globalBuffering = false; notify(); });
  }

  // Set up lock screen / media session controls
  const currentTrack = globalState.tracks[globalState.currentIndex];
  if (currentTrack) updateMediaSession(currentTrack);
}

// ─── Public API (called from music pages — synchronous with user click) ───

export function playTrack(track: PlayerTrack) {
  globalState = {
    tracks: [track],
    currentIndex: 0,
    isPlaying: true,
    isVisible: true,
  };
  loadAndPlay(track.audioUrl);
  trackPlay({
    trackId: track.trackId || track.audioUrl,
    trackName: track.title,
    releaseId: track.releaseId,
    releaseName: track.releaseTitle,
  });
  notify();
}

export function playAlbum(tracks: PlayerTrack[], startIndex = 0) {
  globalState = {
    tracks,
    currentIndex: startIndex,
    isPlaying: true,
    isVisible: true,
  };
  const track = tracks[startIndex];
  loadAndPlay(track.audioUrl);
  trackPlay({
    trackId: track.trackId || track.audioUrl,
    trackName: track.title,
    releaseId: track.releaseId,
    releaseName: track.releaseTitle,
  });
  notify();
}

export function closePlayer() {
  if (globalHowl) {
    globalHowl.unload();
    globalHowl = null;
  }
  globalState = { ...globalState, isPlaying: false, isVisible: false };
  notify();
}

// ─── React hook to subscribe to global state ───

function usePlayerState() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return globalState;
}

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── Component ───

export default function AudioPlayer() {
  const state = usePlayerState();
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(globalVolume);
  const [muted, setMuted] = useState(globalMuted);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const rafRef = useRef<number>(0);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);

  const currentTrack = state.tracks[state.currentIndex];

  // Progress + duration loop (throttled to ~4 updates/sec for perf)
  const lastUpdateRef = useRef(0);
  const startProgressLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const THROTTLE_MS = 250;
    const tick = () => {
      const now = performance.now();
      if (globalHowl && !isDraggingRef.current && now - lastUpdateRef.current > THROTTLE_MS) {
        lastUpdateRef.current = now;
        const seek = globalHowl.seek();
        if (typeof seek === 'number' && isFinite(seek)) {
          setProgress(seek);
        }
        const dur = globalHowl.duration();
        if (dur && isFinite(dur)) {
          setDuration(dur);
        }
        setBuffering(globalBuffering);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopProgressLoop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Start/stop progress loop based on playing state
  useEffect(() => {
    if (state.isPlaying) {
      startProgressLoop();
    } else {
      stopProgressLoop();
    }
    return () => stopProgressLoop();
  }, [state.isPlaying, state.currentIndex, startProgressLoop, stopProgressLoop]);

  // Sync volume to module-level state and active Howl
  useEffect(() => {
    globalVolume = volume;
    globalMuted = muted;
    if (globalHowl) {
      globalHowl.volume(muted ? 0 : volume);
    }
  }, [volume, muted]);

  // Reset progress when track changes
  useEffect(() => {
    setProgress(0);
    setDuration(0);
  }, [state.currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProgressLoop();
    };
  }, [stopProgressLoop]);

  // ─── Handlers (synchronous with user gesture for Safari) ───

  function togglePlay() {
    if (!globalHowl) return;
    if (state.isPlaying) {
      globalHowl.pause();
    } else {
      globalHowl.play();
    }
  }

  function prevTrack() {
    if (state.currentIndex > 0) {
      const newIndex = state.currentIndex - 1;
      const track = state.tracks[newIndex];
      globalState = { ...globalState, currentIndex: newIndex, isPlaying: true };
      loadAndPlay(track.audioUrl);
      trackPlay({
        trackId: track.trackId || track.audioUrl,
        trackName: track.title,
        releaseId: track.releaseId,
        releaseName: track.releaseTitle,
      });
      notify();
    }
  }

  function nextTrack() {
    if (state.currentIndex < state.tracks.length - 1) {
      const newIndex = state.currentIndex + 1;
      const track = state.tracks[newIndex];
      globalState = { ...globalState, currentIndex: newIndex, isPlaying: true };
      loadAndPlay(track.audioUrl);
      trackPlay({
        trackId: track.trackId || track.audioUrl,
        trackName: track.title,
        releaseId: track.releaseId,
        releaseName: track.releaseTitle,
      });
      notify();
    }
  }

  function playFromPlaylist(index: number) {
    const track = state.tracks[index];
    globalState = { ...globalState, currentIndex: index, isPlaying: true };
    loadAndPlay(track.audioUrl);
    trackPlay({
      trackId: track.trackId || track.audioUrl,
      trackName: track.title,
      releaseId: track.releaseId,
      releaseName: track.releaseTitle,
    });
    notify();
  }

  const seekTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function commitSeek(time: number) {
    if (!globalHowl) return;
    setProgress(time); // Update UI immediately
    // Debounce the actual seek to avoid stacking range requests on rapid skips
    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    seekTimeoutRef.current = setTimeout(() => {
      globalHowl?.seek(time);
    }, 80);
  }

  function handleSeekMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (!seekBarRef.current || !duration) return;
    isDraggingRef.current = true;
    setIsSeeking(true);
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const time = pct * duration;
    setProgress(time);
    pendingSeekRef.current = time;

    const onMove = (ev: MouseEvent) => {
      if (!seekBarRef.current || !duration) return;
      const r = seekBarRef.current.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      const t = p * duration;
      setProgress(t);
      pendingSeekRef.current = t;
    };
    const onUp = () => {
      isDraggingRef.current = false;
      setIsSeeking(false);
      if (pendingSeekRef.current !== null) {
        commitSeek(pendingSeekRef.current);
        pendingSeekRef.current = null;
      }
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }

  function handleSeekTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (!seekBarRef.current || !duration) return;
    e.preventDefault(); // Prevent scroll interference
    isDraggingRef.current = true;
    setIsSeeking(true);
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
    const time = pct * duration;
    setProgress(time);
    pendingSeekRef.current = time;
  }

  function handleSeekTouchMove(e: React.TouchEvent<HTMLDivElement>) {
    if (!isDraggingRef.current || !seekBarRef.current || !duration) return;
    e.preventDefault(); // Prevent scroll interference
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.touches[0].clientX - rect.left) / rect.width));
    const time = pct * duration;
    setProgress(time);
    pendingSeekRef.current = time;
  }

  function handleSeekTouchEnd() {
    isDraggingRef.current = false;
    setIsSeeking(false);
    if (pendingSeekRef.current !== null) {
      commitSeek(pendingSeekRef.current);
      pendingSeekRef.current = null;
    }
  }

  function skipForward() {
    if (!globalHowl || !duration) return;
    const current = globalHowl.seek() as number;
    const time = Math.min(duration, current + 15);
    commitSeek(time);
  }

  function skipBackward() {
    if (!globalHowl) return;
    const current = globalHowl.seek() as number;
    const time = Math.max(0, current - 15);
    commitSeek(time);
  }

  function handleClose() {
    stopProgressLoop();
    setProgress(0);
    setDuration(0);
    closePlayer();
  }

  if (!state.isVisible || !currentTrack) return null;

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a] border-t border-[#333]">
      {/* Playlist popup */}
      {showPlaylist && state.tracks.length > 1 && (
        <div className="absolute bottom-full left-0 right-0 bg-[#1a1a1a] border-t border-[#333] max-h-64 overflow-y-auto">
          {state.tracks.map((track, i) => (
            <button
              key={i}
              onClick={() => playFromPlaylist(i)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#252525] transition-colors text-left ${
                i === state.currentIndex ? 'bg-[#252525] text-[#c41e3a]' : 'text-[#f5f5f0]'
              }`}
            >
              <span className="text-sm text-[#888888] w-6 text-right">{i + 1}</span>
              <span className="text-sm flex-1 truncate">{track.title}</span>
              <span className="text-xs text-[#888888]">{track.duration}</span>
            </button>
          ))}
        </div>
      )}

      {/* Progress bar (drag + touch) */}
      <div
        ref={seekBarRef}
        className="h-2 bg-[#333] cursor-pointer group relative touch-none select-none"
        onMouseDown={handleSeekMouseDown}
        onTouchStart={handleSeekTouchStart}
        onTouchMove={handleSeekTouchMove}
        onTouchEnd={handleSeekTouchEnd}
      >
        {/* Larger invisible touch target */}
        <div className="absolute -top-3 -bottom-3 left-0 right-0" />
        <div
          className="h-full bg-[#c41e3a] group-hover:bg-[#e63946] transition-colors relative"
          style={{ width: `${progressPct}%`, transition: isDraggingRef.current ? 'none' : 'width 250ms linear' }}
        >
          <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#f5f5f0] rounded-full shadow transition-opacity ${isSeeking ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100'}`} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {currentTrack.coverArt && (
            <img
              src={currentTrack.coverArt}
              alt=""
              className="w-10 h-10 rounded object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#f5f5f0] truncate">{currentTrack.title}</p>
            <p className="text-xs text-[#888888] truncate">{currentTrack.releaseTitle}</p>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={prevTrack}
            disabled={state.currentIndex === 0}
            className="p-2 text-[#888888] hover:text-[#f5f5f0] disabled:opacity-30 transition-colors"
            title="Previous track"
          >
            <BackwardIcon className="w-4 h-4" />
          </button>

          <button
            onClick={skipBackward}
            className="p-2 text-[#888888] hover:text-[#f5f5f0] transition-colors relative"
            title="Back 15 seconds"
          >
            <BackwardIcon className="w-3.5 h-3.5" />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#888888]">15</span>
          </button>

          <button
            onClick={togglePlay}
            className="p-2 w-10 h-10 bg-[#c41e3a] hover:bg-[#e63946] rounded-full flex items-center justify-center transition-colors"
          >
            {buffering ? (
              <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            ) : state.isPlaying ? (
              <PauseIcon className="w-5 h-5 text-white" />
            ) : (
              <PlayIcon className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={skipForward}
            className="p-2 text-[#888888] hover:text-[#f5f5f0] transition-colors relative"
            title="Forward 15 seconds"
          >
            <ForwardIcon className="w-3.5 h-3.5" />
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold text-[#888888]">15</span>
          </button>

          <button
            onClick={nextTrack}
            disabled={state.currentIndex >= state.tracks.length - 1}
            className="p-2 text-[#888888] hover:text-[#f5f5f0] disabled:opacity-30 transition-colors"
            title="Next track"
          >
            <ForwardIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Time */}
        <div className="text-xs text-[#888888] w-24 text-center hidden sm:block">
          {formatTime(progress)} / {formatTime(duration)}
        </div>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="p-1 text-[#888888] hover:text-[#f5f5f0] transition-colors"
          >
            {muted || volume === 0 ? (
              <SpeakerXMarkIcon className="w-4 h-4" />
            ) : (
              <SpeakerWaveIcon className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setMuted(false);
            }}
            className="w-20 accent-[#c41e3a]"
          />
        </div>

        {/* Playlist toggle */}
        {state.tracks.length > 1 && (
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-2 transition-colors ${
              showPlaylist ? 'text-[#c41e3a]' : 'text-[#888888] hover:text-[#f5f5f0]'
            }`}
          >
            <QueueListIcon className="w-4 h-4" />
          </button>
        )}

        {/* Close */}
        <button
          onClick={handleClose}
          className="p-2 text-[#888888] hover:text-[#f5f5f0] transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

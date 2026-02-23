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

export interface PlayerTrack {
  title: string;
  audioUrl: string;
  duration: string;
  releaseTitle: string;
  coverArt: string;
}

interface AudioPlayerState {
  tracks: PlayerTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isVisible: boolean;
}

// Global audio player state (singleton)
let globalState: AudioPlayerState = {
  tracks: [],
  currentIndex: 0,
  isPlaying: false,
  isVisible: false,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function playTrack(track: PlayerTrack) {
  globalState = {
    tracks: [track],
    currentIndex: 0,
    isPlaying: true,
    isVisible: true,
  };
  notify();
}

export function playAlbum(tracks: PlayerTrack[], startIndex = 0) {
  globalState = {
    tracks,
    currentIndex: startIndex,
    isPlaying: true,
    isVisible: true,
  };
  notify();
}

export function closePlayer() {
  globalState = { ...globalState, isPlaying: false, isVisible: false };
  notify();
}

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

export default function AudioPlayer() {
  const state = usePlayerState();
  const howlRef = useRef<Howl | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const rafRef = useRef<number>(0);
  const loadedUrlRef = useRef<string>('');

  const currentTrack = state.tracks[state.currentIndex];

  const updateProgress = useCallback(() => {
    if (howlRef.current && howlRef.current.playing()) {
      setProgress(howlRef.current.seek() as number);
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  }, []);

  // Load and play track when it changes
  useEffect(() => {
    if (!currentTrack?.audioUrl) return;
    if (loadedUrlRef.current === currentTrack.audioUrl && howlRef.current) {
      // Same track, just toggle play/pause
      if (state.isPlaying) {
        howlRef.current.play();
        rafRef.current = requestAnimationFrame(updateProgress);
      } else {
        howlRef.current.pause();
        cancelAnimationFrame(rafRef.current);
      }
      return;
    }

    // New track - destroy old and create new
    if (howlRef.current) {
      howlRef.current.unload();
    }
    cancelAnimationFrame(rafRef.current);

    loadedUrlRef.current = currentTrack.audioUrl;

    const howl = new Howl({
      src: [currentTrack.audioUrl],
      html5: true,
      volume: muted ? 0 : volume,
      onplay: () => {
        setDuration(howl.duration());
        rafRef.current = requestAnimationFrame(updateProgress);
      },
      onend: () => {
        cancelAnimationFrame(rafRef.current);
        // Auto-advance to next track
        if (state.currentIndex < state.tracks.length - 1) {
          globalState = { ...globalState, currentIndex: state.currentIndex + 1 };
          notify();
        } else {
          globalState = { ...globalState, isPlaying: false };
          notify();
        }
      },
      onload: () => {
        setDuration(howl.duration());
      },
    });

    howlRef.current = howl;

    if (state.isPlaying) {
      howl.play();
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [currentTrack?.audioUrl, state.isPlaying, state.currentIndex, updateProgress, muted, volume]);

  // Update volume
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(muted ? 0 : volume);
    }
  }, [volume, muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (howlRef.current) {
        howlRef.current.unload();
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function togglePlay() {
    globalState = { ...globalState, isPlaying: !state.isPlaying };
    notify();
  }

  function prevTrack() {
    if (state.currentIndex > 0) {
      loadedUrlRef.current = '';
      globalState = { ...globalState, currentIndex: state.currentIndex - 1, isPlaying: true };
      notify();
    }
  }

  function nextTrack() {
    if (state.currentIndex < state.tracks.length - 1) {
      loadedUrlRef.current = '';
      globalState = { ...globalState, currentIndex: state.currentIndex + 1, isPlaying: true };
      notify();
    }
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    if (!howlRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const time = pct * duration;
    howlRef.current.seek(time);
    setProgress(time);
  }

  function handleClose() {
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
    loadedUrlRef.current = '';
    cancelAnimationFrame(rafRef.current);
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
              onClick={() => {
                loadedUrlRef.current = '';
                globalState = { ...globalState, currentIndex: i, isPlaying: true };
                notify();
              }}
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

      {/* Progress bar (clickable) */}
      <div
        className="h-1 bg-[#333] cursor-pointer group"
        onClick={seek}
      >
        <div
          className="h-full bg-[#c41e3a] group-hover:bg-[#e63946] transition-colors relative"
          style={{ width: `${progressPct}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-[#f5f5f0] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <div className="flex items-center gap-2">
          <button
            onClick={prevTrack}
            disabled={state.currentIndex === 0}
            className="p-2 text-[#888888] hover:text-[#f5f5f0] disabled:opacity-30 transition-colors"
          >
            <BackwardIcon className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 w-10 h-10 bg-[#c41e3a] hover:bg-[#e63946] rounded-full flex items-center justify-center transition-colors"
          >
            {state.isPlaying ? (
              <PauseIcon className="w-5 h-5 text-white" />
            ) : (
              <PlayIcon className="w-5 h-5 text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            disabled={state.currentIndex >= state.tracks.length - 1}
            className="p-2 text-[#888888] hover:text-[#f5f5f0] disabled:opacity-30 transition-colors"
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

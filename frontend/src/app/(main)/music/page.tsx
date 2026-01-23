'use client';

import { motion } from 'framer-motion';
import { Music, Play, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  FadeUp,
  SlideIn,
  TornDivider,
  NoiseOverlay,
  MagneticHover,
} from '@/components/animations';
import { Visible } from '@/contexts/VisibilityContext';

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

export default function MusicPage() {
  const [data, setData] = useState<MusicData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/music')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="relative pt-20 min-h-screen bg-void flex items-center justify-center">
        <div className="text-concrete">Loading...</div>
      </div>
    );
  }

  const streamingPlatforms = data?.streamingPlatforms || [];
  const releases = data?.releases || [];
  const latestRelease = releases[0];

  return (
    <div className="relative pt-20">
      <NoiseOverlay />

      {/* Header */}
      <section className="py-16 bg-void relative overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-blood/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 0.5 }}
          >
            <span className="tag mb-4 inline-block">Listen</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-paper mb-4"
          >
            MUSIC
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-concrete"
          >
            Hoard these riffs.
          </motion.p>
        </div>
      </section>

      <TornDivider color="charcoal" />

      {/* Featured Release */}
      <Visible path="sections.music.featuredRelease">
        <section className="section bg-charcoal">
          <div className="container mx-auto px-4">
            <FadeUp>
              <h2 className="text-paper mb-8">LATEST RELEASE</h2>
            </FadeUp>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <SlideIn direction="left">
                <div className="relative group">
                  <motion.div
                    className="aspect-square bg-void border-4 border-blood flex items-center justify-center relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {latestRelease?.coverArt ? (
                      <img src={latestRelease.coverArt} alt={latestRelease.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="halftone absolute inset-0 flex items-center justify-center">
                        <Music className="w-32 h-32 text-blood" />
                      </div>
                    )}

                    {/* Hover play overlay */}
                    <motion.div
                      className="absolute inset-0 bg-blood/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2 }}
                        className="w-24 h-24 rounded-full bg-paper flex items-center justify-center cursor-pointer"
                      >
                        <Play className="w-12 h-12 text-blood ml-1" />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blood" />
                </div>
              </SlideIn>

              <SlideIn direction="right">
                <div>
                  <motion.span
                    className="tag mb-4 inline-block"
                    animate={{ rotate: [-2, 2, -2] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {latestRelease ? latestRelease.type.toUpperCase() : 'Coming Soon'}
                  </motion.span>
                  <h3 className="text-4xl md:text-5xl font-display text-paper mb-4">
                    {latestRelease?.title || 'NEW MUSIC'}
                  </h3>
                  <p className="text-concrete mb-8 text-lg">
                    {latestRelease
                      ? `${latestRelease.tracks.length} tracks of pure squirrelcore chaos.`
                      : "We're cooking up something unholy in the studio. New riffs, new chaos, same squirrelcore energy. Stay tuned for announcements."}
                  </p>

                  {/* Streaming platforms */}
                  <Visible path="sections.music.streamingLinks">
                    <Visible path="elements.buttons.musicStreamingButtons">
                      <div className="flex flex-wrap gap-3">
                        {streamingPlatforms.map((platform) => (
                          <MagneticHover key={platform.name}>
                            <motion.a
                              href={platform.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 text-paper font-display uppercase tracking-wider text-sm inline-flex items-center gap-2"
                              style={{ backgroundColor: platform.color }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {platform.name}
                              <ExternalLink className="w-4 h-4" />
                            </motion.a>
                          </MagneticHover>
                        ))}
                      </div>
                    </Visible>
                  </Visible>
                </div>
              </SlideIn>
            </div>
          </div>
        </section>
      </Visible>

      <TornDivider color="void" />

      {/* Discography */}
      <Visible path="sections.music.discography">
        <section className="section bg-void">
          <div className="container mx-auto px-4">
            <FadeUp>
              <h2 className="text-paper mb-8">DISCOGRAPHY</h2>
            </FadeUp>

            {releases.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {releases.map((release) => (
                  <FadeUp key={release.id}>
                    <div className="card">
                      <div className="aspect-square bg-charcoal mb-4 flex items-center justify-center overflow-hidden">
                        {release.coverArt ? (
                          <img src={release.coverArt} alt={release.title} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-16 h-16 text-blood" />
                        )}
                      </div>
                      <span className="tag mb-2 inline-block text-xs">{release.type}</span>
                      <h3 className="text-xl font-display text-paper mb-1">{release.title}</h3>
                      <p className="text-concrete text-sm">{release.tracks.length} tracks</p>
                    </div>
                  </FadeUp>
                ))}
              </div>
            ) : (
              <FadeUp delay={0.1}>
                <div className="card text-center py-16">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <Music className="w-20 h-20 text-blood mx-auto mb-6" />
                  </motion.div>
                  <h3 className="text-2xl font-display text-paper mb-4">
                    RELEASES COMING SOON
                  </h3>
                  <p className="text-concrete max-w-md mx-auto mb-8">
                    Our discography is in the works. Follow us on social media to be the first to know when we drop new music.
                  </p>
                  <div className="flex justify-center gap-4">
                    <MagneticHover>
                      <motion.a
                        href="https://instagram.com/unholyrodentsband"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Follow on Instagram
                      </motion.a>
                    </MagneticHover>
                  </div>
                </div>
              </FadeUp>
            )}
          </div>
        </section>
      </Visible>
    </div>
  );
}

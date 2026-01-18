'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Calendar, Music, ArrowRight, Play, Volume2 } from 'lucide-react';
import {
  FadeUp,
  SlideIn,
  StaggerContainer,
  StaggerItem,
  GlitchText,
  ScrambleText,
  TornDivider,
  NoiseOverlay,
  Marquee,
  HoverCard,
  MagneticHover,
  Pulse,
} from '@/components/animations';

export default function HomePage() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <div className="relative">
      <NoiseOverlay />

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-void"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Red glow */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blood/20 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blood/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        {/* Hero content */}
        <motion.div
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          className="relative z-10 container mx-auto px-4 text-center"
        >
          {/* Main title */}
          <div className="mb-6">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-7xl md:text-9xl lg:text-[12rem] font-display leading-none"
            >
              <GlitchText text="UNHOLY" className="text-blood block" />
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-7xl md:text-9xl lg:text-[12rem] font-display leading-none"
            >
              <span className="text-paper">RODENTS</span>
            </motion.h1>
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-lg md:text-xl text-concrete font-mono tracking-widest mb-12"
          >
            <p><ScrambleText text="SQUIRRELCORE FROM THE DEPTHS OF THE SQUNDERWORLD" /></p>
            <p className="text-[#c41e3a] mt-2"><ScrambleText text="HAIL SQUĀTAN" /></p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticHover>
              <Link href="/shows">
                <motion.button
                  className="btn btn-blood"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  See Shows
                </motion.button>
              </Link>
            </MagneticHover>
            <MagneticHover>
              <Link href="/music">
                <motion.button
                  className="btn btn-outline"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Music className="w-5 h-5 mr-2" />
                  Listen Now
                </motion.button>
              </Link>
            </MagneticHover>
          </motion.div>
        </motion.div>

      </section>

      {/* Marquee Banner */}
      <div className="bg-blood py-4 overflow-hidden">
        <Marquee speed={30}>
          <span className="text-paper font-display text-xl uppercase tracking-widest mx-8">
            HAIL SQUĀTAN
          </span>
          <span className="text-paper/50 mx-4">{'//'}/</span>
          <span className="text-paper font-display text-xl uppercase tracking-widest mx-8">
            FUCK ANIMAL CONTROL
          </span>
          <span className="text-paper/50 mx-4">{'//'}/</span>
          <span className="text-paper font-display text-xl uppercase tracking-widest mx-8">
            STAY NUTS
          </span>
          <span className="text-paper/50 mx-4">{'//'}/</span>
          <span className="text-paper font-display text-xl uppercase tracking-widest mx-8">
            SQUIRRELCORE
          </span>
          <span className="text-paper/50 mx-4">{'//'}/</span>
        </Marquee>
      </div>

      {/* Next Show Section */}
      <section className="section bg-charcoal">
        <div className="container mx-auto px-4">
          <StaggerContainer>
            <StaggerItem>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-paper">NEXT SHOW</h2>
                <motion.span
                  className="tag"
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Coming Soon
                </motion.span>
              </div>
            </StaggerItem>

            <StaggerItem>
              <HoverCard className="card card-border max-w-2xl">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Pulse>
                      <div className="w-24 h-24 bg-blood flex flex-col items-center justify-center">
                        <span className="text-3xl font-display font-bold text-paper">TBA</span>
                        <span className="text-sm uppercase tracking-wider text-paper/80">2025</span>
                      </div>
                    </Pulse>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-display text-paper mb-2">
                      Show dates coming soon
                    </h3>
                    <p className="text-concrete mb-4">
                      Check back for upcoming shows or sign up for our mailing list to get notified.
                    </p>
                    <Link
                      href="/contact"
                      className="text-blood hover:text-blood-bright inline-flex items-center gap-2 font-display uppercase tracking-wider text-sm transition-colors"
                    >
                      Get notified
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </Link>
                  </div>
                </div>
              </HoverCard>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <TornDivider color="void" />

      {/* Latest Release Section */}
      <section className="section bg-void">
        <div className="container mx-auto px-4">
          <FadeUp>
            <h2 className="text-paper mb-12">LATEST RELEASE</h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Album artwork placeholder */}
            <SlideIn direction="left">
              <div className="relative group">
                <motion.div
                  className="aspect-square bg-charcoal border-4 border-blood flex items-center justify-center relative overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Halftone overlay effect */}
                  <div className="halftone absolute inset-0 flex items-center justify-center">
                    <Music className="w-24 h-24 text-blood" />
                  </div>

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 bg-blood/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="w-20 h-20 rounded-full bg-paper flex items-center justify-center cursor-pointer"
                    >
                      <Play className="w-10 h-10 text-blood ml-1" />
                    </motion.div>
                  </motion.div>
                </motion.div>

                {/* Decorative corner */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blood" />
              </div>
            </SlideIn>

            <SlideIn direction="right">
              <div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
                  viewport={{ once: true }}
                  className="inline-block mb-4"
                >
                  <span className="tag">Coming Soon</span>
                </motion.div>
                <h3 className="text-4xl md:text-5xl font-display text-paper mb-4">
                  NEW MUSIC
                </h3>
                <p className="text-concrete mb-8 text-lg">
                  New music is in the works. Stay tuned for announcements about our upcoming releases.
                  Subscribe to get notified when we drop.
                </p>

                <div className="flex flex-wrap gap-4">
                  <motion.button
                    className="btn btn-blood"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Coming Soon
                  </motion.button>
                  <Link href="/music">
                    <motion.button
                      className="btn btn-outline"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Discography
                    </motion.button>
                  </Link>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      <TornDivider color="void" />

      {/* Social Feed Section */}
      <section className="section bg-void overflow-hidden">
        <div className="container mx-auto px-4">
          <FadeUp>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-12">
              <h2 className="text-paper">FOLLOW THE CHAOS</h2>
              <div className="flex gap-4">
                <motion.a
                  href="https://instagram.com/unholyrodentsband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  @unholyrodentsband
                </motion.a>
                <motion.a
                  href="https://facebook.com/unholyrodents"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Facebook
                </motion.a>
              </div>
            </div>
          </FadeUp>

          {/* Scrolling Social Feed */}
          <div className="relative">
            {/* Gradient fade on sides */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

            {/* Auto-scrolling feed */}
            <motion.div
              className="flex gap-4"
              animate={{ x: [0, -1200] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            >
              {/* Placeholder posts - replace with real Instagram embeds */}
              {[...Array(8)].map((_, i) => (
                <motion.a
                  key={i}
                  href="https://instagram.com/unholyrodentsband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-64 h-64 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#c41e3a] transition-colors relative group overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <span className="text-5xl font-display text-[#c41e3a] mb-2">
                      {['🐿️', '🔥', '🎸', '🤘', '💀', '⚡', '🎤', '🥁'][i]}
                    </span>
                    <span className="text-xs font-mono text-[#888888] uppercase tracking-wider text-center">
                      Follow for updates
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#c41e3a]/0 group-hover:bg-[#c41e3a]/10 transition-colors" />
                </motion.a>
              ))}
              {/* Duplicate for seamless loop */}
              {[...Array(8)].map((_, i) => (
                <motion.a
                  key={`dup-${i}`}
                  href="https://instagram.com/unholyrodentsband"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-64 h-64 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#c41e3a] transition-colors relative group overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <span className="text-5xl font-display text-[#c41e3a] mb-2">
                      {['🐿️', '🔥', '🎸', '🤘', '💀', '⚡', '🎤', '🥁'][i]}
                    </span>
                    <span className="text-xs font-mono text-[#888888] uppercase tracking-wider text-center">
                      Follow for updates
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-[#c41e3a]/0 group-hover:bg-[#c41e3a]/10 transition-colors" />
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Call to action */}
          <FadeUp delay={0.2}>
            <p className="text-center text-[#888888] text-sm mt-8 font-mono">
              Latest posts from @unholyrodentsband • Follow for show announcements & behind the scenes chaos
            </p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

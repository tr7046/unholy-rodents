'use client';

import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useEffect, useState, ReactNode } from 'react';

// ============================================
// FADE ANIMATIONS
// ============================================

interface FadeProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export function FadeIn({ children, delay = 0, duration = 0.6, className = '' }: FadeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, delay = 0, duration = 0.6, className = '' }: FadeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeDown({ children, delay = 0, duration = 0.6, className = '' }: FadeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -40 }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SLIDE ANIMATIONS
// ============================================

interface SlideProps extends FadeProps {
  direction?: 'left' | 'right';
}

export function SlideIn({ children, delay = 0, duration = 0.6, direction = 'left', className = '' }: SlideProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const x = direction === 'left' ? -60 : 60;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SCALE ANIMATIONS
// ============================================

export function ScaleIn({ children, delay = 0, duration = 0.5, className = '' }: FadeProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration, delay, ease: [0.68, -0.55, 0.265, 1.55] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// TEXT ANIMATIONS
// ============================================

interface TextRevealProps {
  text: string;
  delay?: number;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

export function TextReveal({ text, delay = 0, className = '', as: Component = 'span' }: TextRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <Component ref={ref} className={`overflow-hidden inline-block ${className}`}>
      <motion.span
        className="inline-block"
        initial={{ y: '100%' }}
        animate={isInView ? { y: 0 } : { y: '100%' }}
        transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {text}
      </motion.span>
    </Component>
  );
}

export function GlitchText({ text, className = '' }: { text: string; className?: string }) {
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className={`glitch relative inline-block ${className}`} data-text={text}>
      <motion.span
        animate={isGlitching ? {
          x: [0, -3, 3, -3, 0],
          textShadow: [
            'none',
            '3px 0 #c41e3a, -3px 0 #ebe8df',
            '-3px 0 #c41e3a, 3px 0 #ebe8df',
            '3px 0 #c41e3a, -3px 0 #ebe8df',
            'none'
          ]
        } : {}}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.span>
    </span>
  );
}

export function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(true);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';

  useEffect(() => {
    if (!isScrambling) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) return text[index];
            if (char === ' ') return ' ';
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
        setIsScrambling(false);
      }
      iteration += 1 / 3;
    }, 30);

    return () => clearInterval(interval);
  }, [text, isScrambling]);

  return <span className={className}>{displayText}</span>;
}

// ============================================
// STAGGER CONTAINER
// ============================================

interface StaggerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({ children, staggerDelay = 0.1, className = '' }: StaggerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PARALLAX
// ============================================

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className = '' }: ParallaxProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed]);

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

// ============================================
// MAGNETIC HOVER
// ============================================

export function MagneticHover({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - left - width / 2) * 0.3;
    const y = (clientY - top - height / 2) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// HOVER CARD
// ============================================

export function HoverCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        boxShadow: '0 20px 40px rgba(196, 30, 58, 0.3)',
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// SHAKE ON HOVER
// ============================================

export function ShakeOnHover({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{
        x: [0, -5, 5, -5, 5, 0],
        transition: { duration: 0.4 },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PULSE
// ============================================

export function Pulse({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(196, 30, 58, 0.4)',
          '0 0 0 20px rgba(196, 30, 58, 0)',
          '0 0 0 0 rgba(196, 30, 58, 0)',
        ],
      }}
      transition={{ duration: 2, repeat: Infinity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================
// PAGE TRANSITION
// ============================================

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// ============================================
// TORN PAPER DIVIDER
// ============================================

export function TornDivider({ color = 'void', className = '' }: { color?: 'void' | 'charcoal'; className?: string }) {
  const fillColor = color === 'charcoal' ? '#1a1a1a' : '#0a0a0a';

  return (
    <div className={`relative w-full h-12 -mt-px ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1200 50" preserveAspectRatio="none" className="w-full h-full">
        <path
          d="M0,50 L0,20 Q30,25 60,15 T120,22 T180,10 T240,18 T300,8 T360,20 T420,12 T480,25 T540,15 T600,20 T660,10 T720,22 T780,8 T840,18 T900,12 T960,20 T1020,15 T1080,22 T1140,10 T1200,18 L1200,50 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
}

// ============================================
// NOISE OVERLAY
// ============================================

export function NoiseOverlay() {
  return <div className="noise-overlay" />;
}

// ============================================
// MARQUEE
// ============================================

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Marquee({ children, speed = 20, className = '' }: MarqueeProps) {
  return (
    <div className={`marquee ${className}`}>
      <motion.div
        className="flex gap-8"
        animate={{ x: '-50%' }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

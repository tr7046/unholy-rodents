import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Brutal & Raw
        'void': '#0a0a0a',
        'charcoal': '#1a1a1a',
        'ash': '#2a2a2a',
        'concrete': '#888888',
        'cream': '#ebe8df',
        'paper': '#f5f5f0',
        // Accent - Blood Red
        'blood': '#c41e3a',
        'blood-bright': '#e63946',
        'blood-dark': '#8b0000',
      },
      fontFamily: {
        display: ['Anton', 'Impact', 'Arial Black', 'sans-serif'],
        body: ['Space Grotesk', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      animation: {
        // Grain/noise
        'grain': 'grain 0.5s steps(10) infinite',
        // Text animations
        'text-reveal': 'text-reveal 0.8s ease-out forwards',
        'text-glitch': 'text-glitch 0.3s ease-in-out',
        'letter-scramble': 'letter-scramble 0.1s steps(1) infinite',
        // Movement
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'fade-down': 'fade-down 0.6s ease-out forwards',
        'slide-left': 'slide-left 0.6s ease-out forwards',
        'slide-right': 'slide-right 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.4s ease-out forwards',
        // Continuous
        'pulse-blood': 'pulse-blood 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'flicker': 'flicker 0.15s infinite',
        // Borders/Lines
        'line-draw': 'line-draw 0.6s ease-out forwards',
        'border-glow': 'border-glow 2s ease-in-out infinite',
        // Special
        'torn-reveal': 'torn-reveal 1s ease-out forwards',
        'stamp': 'stamp 0.3s ease-out forwards',
      },
      keyframes: {
        'grain': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-1%, -1%)' },
          '20%': { transform: 'translate(1%, 1%)' },
          '30%': { transform: 'translate(-1%, 1%)' },
          '40%': { transform: 'translate(1%, -1%)' },
          '50%': { transform: 'translate(-1%, 0)' },
          '60%': { transform: 'translate(1%, 0)' },
          '70%': { transform: 'translate(0, 1%)' },
          '80%': { transform: 'translate(0, -1%)' },
          '90%': { transform: 'translate(1%, 1%)' },
        },
        'text-reveal': {
          from: { clipPath: 'inset(0 100% 0 0)' },
          to: { clipPath: 'inset(0 0 0 0)' },
        },
        'text-glitch': {
          '0%': { transform: 'translate(0)', textShadow: 'none' },
          '20%': { transform: 'translate(-3px, 3px)', textShadow: '3px -3px 0 #c41e3a' },
          '40%': { transform: 'translate(3px, -3px)', textShadow: '-3px 3px 0 #c41e3a' },
          '60%': { transform: 'translate(-3px, -3px)', textShadow: '3px 3px 0 #c41e3a' },
          '80%': { transform: 'translate(3px, 3px)', textShadow: '-3px -3px 0 #c41e3a' },
          '100%': { transform: 'translate(0)', textShadow: 'none' },
        },
        'letter-scramble': {
          '0%': { opacity: '1' },
          '50%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-down': {
          from: { opacity: '0', transform: 'translateY(-30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-left': {
          from: { opacity: '0', transform: 'translateX(50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-right': {
          from: { opacity: '0', transform: 'translateX(-50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.9)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-blood': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(196, 30, 58, 0.4)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(196, 30, 58, 0.2)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'line-draw': {
          from: { width: '0%' },
          to: { width: '100%' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(196, 30, 58, 0.5)' },
          '50%': { borderColor: 'rgba(196, 30, 58, 1)' },
        },
        'torn-reveal': {
          from: { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
          to: { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        },
        'stamp': {
          '0%': { transform: 'scale(2) rotate(-10deg)', opacity: '0' },
          '50%': { transform: 'scale(0.95) rotate(-2deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(-1deg)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url('/textures/noise.png')",
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

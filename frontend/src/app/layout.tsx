import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Anton, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Analytics from '@/components/Analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

async function getSiteConfig(): Promise<{ ogImage: string }> {
  try {
    const res = await fetch(`${API_URL}/content/site-config`, {
      cache: 'no-store',
    });
    if (!res.ok) return { ogImage: '' };
    return await res.json();
  } catch {
    return { ogImage: '' };
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getSiteConfig();
  const ogImage = siteConfig.ogImage || '/og-image.jpg';

  return {
    metadataBase: new URL('https://unholyrodents.com'),
    title: {
      default: 'Unholy Rodents | Squirrelcore from Central Florida',
      template: '%s | Unholy Rodents',
    },
    description: 'Official website of Unholy Rodents - Squirrelcore from Central Florida. Squirrels who serve Squātan. Hail Squātan. Fuck Animal Control. Stay Nuts.',
    keywords: ['squirrelcore', 'thrash punk', 'punk rock', 'metal', 'underground music', 'Unholy Rodents', 'Squātan', 'Central Florida', 'Orlando', 'hardcore', 'crossover thrash'],
    authors: [{ name: 'Unholy Rodents' }],
    creator: 'Unholy Rodents',
    publisher: 'Unholy Rodents',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: 'Unholy Rodents | Squirrelcore from Central Florida',
      description: 'Squirrelcore from Central Florida. Squirrels who serve Squātan. Hail Squātan. Fuck Animal Control. Stay Nuts.',
      type: 'website',
      locale: 'en_US',
      siteName: 'Unholy Rodents',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'Unholy Rodents - Squirrelcore',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Unholy Rodents | Squirrelcore',
      description: 'Squirrelcore from Central Florida. Hail Squātan. Fuck Animal Control. Stay Nuts.',
      images: [ogImage],
    },
    icons: {
      icon: '/icon',
      apple: '/apple-icon',
    },
    manifest: '/manifest.json',
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${anton.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#c41e3a] focus:text-[#f5f5f0] focus:font-display focus:uppercase"
        >
          Skip to main content
        </a>
        <Analytics />
        {children}
      </body>
    </html>
  );
}

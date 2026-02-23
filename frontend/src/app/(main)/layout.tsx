import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VisibilityProvider } from '@/contexts/VisibilityContext';
import { SocialLinksProvider } from '@/contexts/SocialLinksContext';
import AudioPlayer from '@/components/AudioPlayer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VisibilityProvider>
      <SocialLinksProvider>
        <Header />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <AudioPlayer />
      </SocialLinksProvider>
    </VisibilityProvider>
  );
}

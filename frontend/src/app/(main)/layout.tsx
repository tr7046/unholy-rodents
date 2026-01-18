import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { VisibilityProvider } from '@/contexts/VisibilityContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VisibilityProvider>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </VisibilityProvider>
  );
}

'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Youtube, Music2 } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';
import { useVisibility, Visible } from '@/contexts/VisibilityContext';
import { useSocialLinks } from '@/contexts/SocialLinksContext';

const socialConfig = [
  { key: 'instagram' as const, name: 'Instagram', icon: Instagram, visibilityKey: 'instagram' },
  { key: 'facebook' as const, name: 'Facebook', icon: Facebook, visibilityKey: 'facebook' },
  { key: 'youtube' as const, name: 'YouTube', icon: Youtube, visibilityKey: 'youtube' },
  { key: 'spotify' as const, name: 'Spotify', icon: Music2, visibilityKey: 'spotify' },
];

const allFooterLinks = [
  { name: 'Shows', href: '/shows', visibilityKey: 'shows' },
  { name: 'Music', href: '/music', visibilityKey: 'music' },
  { name: 'Store', href: '/store', visibilityKey: 'store' },
  { name: 'About', href: '/about', visibilityKey: 'about' },
  { name: 'Contact', href: '/contact', visibilityKey: 'contact' },
];

export function Footer() {
  const { isVisible } = useVisibility();
  const socials = useSocialLinks();

  // Filter social links based on visibility settings AND having a URL configured
  const socialLinks = useMemo(() => {
    return socialConfig
      .filter(link =>
        isVisible(`navigation.footer.socialLinks.${link.visibilityKey}`) && socials[link.key]
      )
      .map(link => ({ ...link, href: socials[link.key] }));
  }, [isVisible, socials]);

  // Filter footer links based on visibility settings (same as header + pages)
  const footerLinks = useMemo(() => {
    return allFooterLinks.filter(link =>
      isVisible(`pages.${link.visibilityKey}`)
    );
  }, [isVisible]);

  // Don't render footer at all if it's hidden
  if (!isVisible('navigation.footer.visible')) {
    return null;
  }
  return (
    <footer className="bg-void border-t border-charcoal">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <Visible path="navigation.footer.brand">
            <FadeUp>
              <div>
                <h3 className="text-3xl font-display font-bold mb-4">
                  <span className="text-blood">UNHOLY</span> RODENTS
                </h3>
                <p className="text-concrete text-sm mb-6 leading-relaxed">
                  Squirrelcore from Central Florida.
                  <br />
                  <span className="text-blood">Hail Squatan. Fuck Animal Control. Stay Nuts.</span>
                </p>

                {/* Social Links */}
                {socialLinks.length > 0 && (
                  <div className="flex gap-4">
                    {socialLinks.map((link) => (
                      <motion.a
                        key={link.name}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-charcoal flex items-center justify-center text-paper hover:bg-blood hover:text-paper transition-colors"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label={link.name}
                      >
                        <link.icon className="h-5 w-5" />
                      </motion.a>
                    ))}
                  </div>
                )}
              </div>
            </FadeUp>
          </Visible>

          {/* Links */}
          <Visible path="navigation.footer.quickLinks">
            <FadeUp delay={0.1}>
              <div>
                <h4 className="text-sm font-display uppercase tracking-widest text-paper mb-6">
                  Navigation
                </h4>
                {footerLinks.length > 0 && (
                  <StaggerContainer staggerDelay={0.05}>
                    <ul className="space-y-3">
                      {footerLinks.map((link) => (
                        <StaggerItem key={link.name}>
                          <li>
                            <Link
                              href={link.href}
                              className="link-underline text-concrete text-sm"
                            >
                              {link.name}
                            </Link>
                          </li>
                        </StaggerItem>
                      ))}
                    </ul>
                  </StaggerContainer>
                )}
              </div>
            </FadeUp>
          </Visible>

          {/* Contact */}
          <Visible path="navigation.footer.contact">
            <FadeUp delay={0.2}>
              <div>
                <h4 className="text-sm font-display uppercase tracking-widest text-paper mb-6">
                  Contact
                </h4>
                <p className="text-concrete text-sm mb-4">
                  Booking, press, and general inquiries.
                </p>
                <a
                  href="mailto:book@unholyrodents.com"
                  className="text-blood hover:text-blood-bright transition-colors font-mono text-sm"
                >
                  book@unholyrodents.com
                </a>
              </div>
            </FadeUp>
          </Visible>
        </div>

        {/* Bottom bar */}
        <Visible path="navigation.footer.copyright">
          <FadeUp delay={0.3}>
            <div className="mt-16 pt-8 border-t border-charcoal flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-concrete text-xs font-mono">
                &copy; {new Date().getFullYear()} UNHOLY RODENTS
              </p>
              <motion.p
                className="text-concrete text-xs font-mono"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                DESIGNED WITH CHAOS
              </motion.p>
            </div>
          </FadeUp>
        </Visible>
      </div>
    </footer>
  );
}

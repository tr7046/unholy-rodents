'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Youtube, Music2 } from 'lucide-react';
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/animations';

const socialLinks = [
  { name: 'Instagram', href: 'https://instagram.com/unholyrodentsband', icon: Instagram },
  { name: 'Facebook', href: 'https://facebook.com/unholyrodents', icon: Facebook },
  { name: 'YouTube', href: '#', icon: Youtube },
  { name: 'Spotify', href: '#', icon: Music2 },
];

const footerLinks = [
  { name: 'Shows', href: '/shows' },
  { name: 'Music', href: '/music' },
  { name: 'Store', href: '/store' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function Footer() {
  return (
    <footer className="bg-void border-t border-charcoal">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <FadeUp>
            <div>
              <h3 className="text-3xl font-display font-bold mb-4">
                <span className="text-blood">UNHOLY</span> RODENTS
              </h3>
              <p className="text-concrete text-sm mb-6 leading-relaxed">
                Squirrelcore from Central Florida.
                <br />
                <span className="text-blood">Hail Squātan. Fuck Animal Control. Stay Nuts.</span>
              </p>

              {/* Social Links */}
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
            </div>
          </FadeUp>

          {/* Links */}
          <FadeUp delay={0.1}>
            <div>
              <h4 className="text-sm font-display uppercase tracking-widest text-paper mb-6">
                Navigation
              </h4>
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
            </div>
          </FadeUp>

          {/* Contact */}
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
        </div>

        {/* Bottom bar */}
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
      </div>
    </footer>
  );
}

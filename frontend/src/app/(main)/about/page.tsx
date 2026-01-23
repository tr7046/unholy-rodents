'use client';

import { motion } from 'framer-motion';
import { Users, Music, Zap, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
  HoverCard,
  GlitchText,
  TornDivider,
  NoiseOverlay,
  ShakeOnHover,
} from '@/components/animations';
import { Visible } from '@/contexts/VisibilityContext';

interface Member {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface AboutData {
  members: Member[];
  influences: string[];
  philosophy: { title: string; description: string }[];
  bio: string[];
}

export default function AboutPage() {
  const [data, setData] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/about')
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

  if (!data) {
    return (
      <div className="relative pt-20 min-h-screen bg-void flex items-center justify-center">
        <div className="text-blood">Failed to load content</div>
      </div>
    );
  }

  return (
    <div className="relative pt-20">
      <NoiseOverlay />

      {/* Header */}
      <section className="py-16 bg-void relative overflow-hidden">
        <motion.div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blood/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 0.5 }}
          >
            <span className="tag mb-4 inline-block">The Band</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-paper mb-4"
          >
            ABOUT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-concrete"
          >
            The story behind the noise.
          </motion.p>
        </div>
      </section>

      {/* Band Bio */}
      <Visible path="sections.about.bio">
        <TornDivider color="charcoal" />
        <section className="section bg-charcoal">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <FadeUp>
                <h2 className="mb-8">
                  <GlitchText text="UNHOLY RODENTS" className="text-blood" />
                </h2>
              </FadeUp>

              <div className="space-y-6 text-lg">
                {data.bio.map((paragraph, index) => (
                  <FadeUp key={index} delay={0.1 * (index + 1)}>
                    <p className={index === 0 ? "text-paper" : "text-concrete"}>
                      {paragraph}
                    </p>
                  </FadeUp>
                ))}

                <FadeUp delay={0.4}>
                  <motion.p
                    className="text-blood font-display text-2xl uppercase tracking-wider mt-8"
                    animate={{ textShadow: ['0 0 0px #c41e3a', '0 0 10px #c41e3a', '0 0 0px #c41e3a'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Hail Squatan. Fuck Animal Control. Stay Nuts.
                  </motion.p>
                </FadeUp>
              </div>
            </div>
          </div>
        </section>
      </Visible>

      {/* Band Members */}
      <Visible path="sections.about.bandMembers">
        <TornDivider color="void" />
        <section className="section bg-void">
          <div className="container mx-auto px-4">
            <FadeUp>
              <div className="flex items-center gap-4 mb-12">
                <h2 className="text-paper">THE BAND</h2>
                <Users className="w-6 h-6 text-blood" />
              </div>
            </FadeUp>

            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {data.members.map((member) => (
                <StaggerItem key={member.id}>
                  <HoverCard className="card h-full">
                    {/* Photo */}
                    <div className="aspect-square bg-charcoal mb-4 flex items-center justify-center relative overflow-hidden group">
                      <motion.div
                        className="absolute inset-0 bg-blood/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-16 h-16 text-blood relative z-10" />
                      )}
                    </div>

                    {/* Info */}
                    <motion.span
                      className="tag mb-3 inline-block"
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {member.role}
                    </motion.span>
                    <h3 className="text-xl font-display text-paper mb-2">
                      {member.name}
                    </h3>
                    <p className="text-concrete text-sm">{member.bio}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </Visible>

      {/* Influences */}
      <Visible path="sections.about.influences">
        <TornDivider color="charcoal" />
        <section className="section bg-charcoal">
          <div className="container mx-auto px-4">
            <FadeUp>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-paper">INFLUENCES</h2>
                <Music className="w-6 h-6 text-blood" />
              </div>
            </FadeUp>

            <StaggerContainer className="flex flex-wrap gap-3">
              {data.influences.map((band, index) => (
                <StaggerItem key={band}>
                  <ShakeOnHover>
                    <motion.span
                      className="tag-outline inline-block px-4 py-2 border border-blood text-blood font-mono text-sm uppercase tracking-wider cursor-default"
                      style={{ transform: `rotate(${(index % 2 === 0 ? -1 : 1) * (1 + index * 0.3)}deg)` }}
                      whileHover={{ scale: 1.1, backgroundColor: '#c41e3a', color: '#f5f5f0' }}
                      transition={{ duration: 0.2 }}
                    >
                      {band}
                    </motion.span>
                  </ShakeOnHover>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </Visible>

      {/* Philosophy */}
      <Visible path="sections.about.philosophy">
        <TornDivider color="void" />
        <section className="section bg-void">
          <div className="container mx-auto px-4">
            <FadeUp>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-paper">OUR PHILOSOPHY</h2>
                <Zap className="w-6 h-6 text-blood" />
              </div>
            </FadeUp>

            <StaggerContainer className="grid md:grid-cols-3 gap-6">
              {data.philosophy.map((item) => (
                <StaggerItem key={item.title}>
                  <HoverCard className="card card-border">
                    <h3 className="text-xl font-display text-blood mb-2">
                      {item.title}
                    </h3>
                    <p className="text-concrete">{item.description}</p>
                  </HoverCard>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </Visible>

      {/* Contact CTA */}
      <Visible path="sections.about.contactCta">
        <section className="section bg-blood relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)',
            }}
            animate={{ x: [0, 40] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />

          <div className="container mx-auto px-4 text-center relative z-10">
            <FadeUp>
              <h2 className="text-paper mb-4">GET IN TOUCH</h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-paper/80 mb-8 max-w-xl mx-auto">
                Booking, press inquiries, or just want to say what&apos;s up?
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Visible path="elements.buttons.aboutContactCta">
                <motion.a
                  href="/contact"
                  className="btn bg-void text-paper border-2 border-paper hover:bg-paper hover:text-blood transition-colors inline-flex"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact Us <ArrowRight className="w-4 h-4 ml-2" />
                </motion.a>
              </Visible>
            </FadeUp>
          </div>
        </section>
      </Visible>
    </div>
  );
}

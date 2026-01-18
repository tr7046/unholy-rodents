'use client';

import { motion } from 'framer-motion';
import { Mail, Instagram, Facebook, Send, MapPin } from 'lucide-react';
import {
  FadeUp,
  SlideIn,
  StaggerContainer,
  StaggerItem,
  HoverCard,
  TornDivider,
  NoiseOverlay,
  MagneticHover,
} from '@/components/animations';
import { Visible } from '@/contexts/VisibilityContext';

export default function ContactPage() {
  return (
    <div className="relative pt-20">
      <NoiseOverlay />

      {/* Header */}
      <section className="py-16 bg-void relative overflow-hidden">
        <motion.div
          className="absolute top-1/2 right-0 w-96 h-96 bg-blood/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            transition={{ duration: 0.5 }}
          >
            <span className="tag mb-4 inline-block">Get in Touch</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-paper mb-4"
          >
            CONTACT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-concrete"
          >
            Booking, press, or just want to say hey.
          </motion.p>
        </div>
      </section>

      <TornDivider color="charcoal" />

      {/* Contact Content */}
      <section className="section bg-charcoal">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <Visible path="sections.contact.info">
              <div>
                <FadeUp>
                  <h2 className="text-paper mb-8">REACH OUT</h2>
                </FadeUp>

                <StaggerContainer className="space-y-6">
                  <StaggerItem>
                    <HoverCard className="card card-border">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blood flex items-center justify-center flex-shrink-0">
                          <Mail className="w-6 h-6 text-paper" />
                        </div>
                        <div>
                          <h3 className="text-lg font-display text-paper mb-1">BOOKING / PRESS</h3>
                          <p className="text-concrete text-sm mb-2">
                            For show bookings, press inquiries, and business matters.
                          </p>
                          <a
                            href="mailto:book@unholyrodents.com"
                            className="text-blood hover:text-blood-bright transition-colors font-mono text-sm"
                          >
                            book@unholyrodents.com
                          </a>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>

                  <StaggerItem>
                    <HoverCard className="card card-border">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blood flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-paper" />
                        </div>
                        <div>
                          <h3 className="text-lg font-display text-paper mb-1">LOCATION</h3>
                          <p className="text-concrete text-sm">
                            Central Florida
                            <br />
                            <span className="text-blood">Squirrelcore territory</span>
                          </p>
                        </div>
                      </div>
                    </HoverCard>
                  </StaggerItem>
                </StaggerContainer>

                {/* Social Links */}
                <Visible path="sections.contact.socialLinks">
                  <FadeUp delay={0.3}>
                    <div className="mt-12">
                      <h3 className="text-lg font-display text-paper mb-6">FOLLOW US</h3>
                      <div className="flex gap-4">
                        <MagneticHover>
                          <motion.a
                            href="https://instagram.com/unholyrodentsband"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 bg-void border-2 border-blood flex items-center justify-center text-blood hover:bg-blood hover:text-paper transition-colors"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Instagram className="w-6 h-6" />
                          </motion.a>
                        </MagneticHover>
                        <MagneticHover>
                          <motion.a
                            href="https://facebook.com/unholyrodents"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 bg-void border-2 border-blood flex items-center justify-center text-blood hover:bg-blood hover:text-paper transition-colors"
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Facebook className="w-6 h-6" />
                          </motion.a>
                        </MagneticHover>
                      </div>
                    </div>
                  </FadeUp>
                </Visible>
              </div>
            </Visible>

            {/* Contact Form */}
            <Visible path="sections.contact.form">
              <SlideIn direction="right">
                <div className="card">
                  <h2 className="text-paper mb-6">SEND A MESSAGE</h2>

                  <form className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-display uppercase tracking-wider text-paper mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input"
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-display uppercase tracking-wider text-paper mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="input"
                        placeholder="Email"
                        required
                      />
                    </div>

                    <Visible path="elements.features.contactFormSubject">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-display uppercase tracking-wider text-paper mb-2">
                          Subject
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          className="input"
                          required
                        >
                          <option value="">Select a subject</option>
                          <option value="booking">Booking Inquiry</option>
                          <option value="press">Press / Media</option>
                          <option value="merch">Merch Question</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </Visible>

                    <div>
                      <label htmlFor="message" className="block text-sm font-display uppercase tracking-wider text-paper mb-2">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        className="input resize-none"
                        placeholder="Your message..."
                        required
                      />
                    </div>

                    <Visible path="elements.buttons.contactSendMessage">
                      <motion.button
                        type="submit"
                        className="btn btn-blood w-full"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </motion.button>
                    </Visible>
                  </form>
                </div>
              </SlideIn>
            </Visible>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section bg-void">
        <div className="container mx-auto px-4 text-center">
          <FadeUp>
            <motion.p
              className="text-blood font-display text-3xl uppercase tracking-wider"
              animate={{ textShadow: ['0 0 0px #c41e3a', '0 0 20px #c41e3a', '0 0 0px #c41e3a'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Hail Squātan. Fuck Animal Control. Stay Nuts.
            </motion.p>
          </FadeUp>
        </div>
      </section>
    </div>
  );
}

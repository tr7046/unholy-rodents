'use client';

import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import {
  FadeUp,
  StaggerContainer,
  StaggerItem,
  HoverCard,
  TornDivider,
  NoiseOverlay,
  Pulse,
} from '@/components/animations';
import { Visible } from '@/contexts/VisibilityContext';

interface ShowBand {
  bandName: string;
  isHeadliner: boolean;
}

interface Venue {
  name: string;
  city: string;
  state: string;
}

interface Show {
  id: string;
  date: string;
  venue: Venue;
  doorsTime?: string;
  ticketUrl?: string;
  bands?: ShowBand[];
}

const upcomingShows: Show[] = [];
const pastShows: Show[] = [
  {
    id: '1',
    date: '2024-01-15',
    venue: { name: 'The Haven', city: 'Orlando', state: 'FL' },
    bands: [
      { bandName: 'Unholy Rodents', isHeadliner: true },
      { bandName: 'Rat Attack', isHeadliner: false },
    ],
  },
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: date.getDate().toString(),
    year: date.getFullYear().toString(),
  };
}

function ShowCard({ show, isPast = false }: { show: Show; isPast?: boolean }) {
  const { month, day, year } = formatDate(show.date);

  return (
    <HoverCard className={`card card-border ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Date block */}
        <div className="flex-shrink-0">
          {isPast ? (
            <div className="w-24 h-24 bg-charcoal border-2 border-concrete flex flex-col items-center justify-center">
              <span className="text-xs uppercase tracking-wider text-concrete">{month}</span>
              <span className="text-3xl font-display font-bold text-concrete">{day}</span>
              <span className="text-xs text-concrete">{year}</span>
            </div>
          ) : (
            <Pulse>
              <div className="w-24 h-24 bg-blood flex flex-col items-center justify-center">
                <span className="text-xs uppercase tracking-wider text-paper/80">{month}</span>
                <span className="text-3xl font-display font-bold text-paper">{day}</span>
                <span className="text-xs text-paper/80">{year}</span>
              </div>
            </Pulse>
          )}
        </div>

        {/* Show info */}
        <div className="flex-1">
          <h3 className="text-2xl font-display text-paper mb-1">
            {show.venue.name}
          </h3>
          <p className="text-concrete flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4" />
            {show.venue.city}, {show.venue.state}
          </p>

          {show.bands && show.bands.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-concrete">
                w/ {show.bands.filter(b => !b.isHeadliner).map(b => b.bandName).join(', ')}
              </p>
            </div>
          )}

          {show.doorsTime && (
            <p className="text-sm text-concrete flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4" />
              Doors: {show.doorsTime}
            </p>
          )}

          {show.ticketUrl && !isPast && (
            <motion.a
              href={show.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-blood inline-flex text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Ticket className="w-4 h-4 mr-2" />
              Get Tickets
            </motion.a>
          )}
        </div>
      </div>
    </HoverCard>
  );
}

export default function ShowsPage() {
  return (
    <div className="relative pt-20">
      <NoiseOverlay />

      {/* Header */}
      <section className="py-16 bg-void relative overflow-hidden">
        {/* Background glow */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-blood/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="tag mb-4 inline-block">Live</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-paper mb-4"
          >
            SHOWS
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-concrete"
          >
            Catch us live. Get in the pit.
          </motion.p>
        </div>
      </section>

      <TornDivider color="charcoal" />

      {/* Upcoming Shows */}
      <Visible path="sections.shows.upcoming">
        <section className="section bg-charcoal">
          <div className="container mx-auto px-4">
            <FadeUp>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-paper">UPCOMING</h2>
                <Calendar className="w-6 h-6 text-blood" />
              </div>
            </FadeUp>

            {upcomingShows.length > 0 ? (
              <StaggerContainer className="space-y-6">
                {upcomingShows.map((show) => (
                  <StaggerItem key={show.id}>
                    <ShowCard show={show} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <FadeUp delay={0.1}>
                <div className="card text-center py-12">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Calendar className="w-16 h-16 text-blood mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-display text-paper mb-2">
                    NO SHOWS ANNOUNCED
                  </h3>
                  <p className="text-concrete">
                    Check back soon or follow us on social media for announcements.
                  </p>
                </div>
              </FadeUp>
            )}
          </div>
        </section>
      </Visible>

      <TornDivider color="void" />

      {/* Past Shows */}
      <Visible path="sections.shows.past">
        {pastShows.length > 0 && (
          <section className="section bg-void">
            <div className="container mx-auto px-4">
              <FadeUp>
                <h2 className="text-paper mb-8">PAST SHOWS</h2>
              </FadeUp>

              <StaggerContainer className="space-y-4">
                {pastShows.map((show) => (
                  <StaggerItem key={show.id}>
                    <ShowCard show={show} isPast />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </section>
        )}
      </Visible>

      {/* Booking CTA */}
      <Visible path="sections.shows.bookingCta">
        <section className="section bg-blood relative overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(0,0,0,0.1) 20px, rgba(0,0,0,0.1) 40px)',
            }}
            animate={{ x: [0, -40] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          <div className="container mx-auto px-4 text-center relative z-10">
            <FadeUp>
              <h2 className="text-paper mb-4">BOOK US</h2>
            </FadeUp>
            <FadeUp delay={0.1}>
              <p className="text-paper/80 mb-8 max-w-xl mx-auto">
                Want Unholy Rodents to play your venue, festival, or event?
              </p>
            </FadeUp>
            <FadeUp delay={0.2}>
              <Visible path="elements.buttons.showsBookingCta">
                <motion.a
                  href="/contact"
                  className="btn bg-void text-paper border-2 border-paper hover:bg-paper hover:text-blood transition-colors inline-flex"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact for Booking
                </motion.a>
              </Visible>
            </FadeUp>
          </div>
        </section>
      </Visible>
    </div>
  );
}

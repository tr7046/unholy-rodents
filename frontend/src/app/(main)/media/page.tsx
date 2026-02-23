'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Camera, Video, FileImage, Instagram, Facebook } from 'lucide-react';
import { Visible } from '@/contexts/VisibilityContext';
import { useSocialLinks } from '@/contexts/SocialLinksContext';

interface MediaItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  type: 'photo' | 'video' | 'flyer';
}

interface MediaData {
  photos: MediaItem[];
  videos: MediaItem[];
  flyers: MediaItem[];
}

export default function MediaPage() {
  const socials = useSocialLinks();
  const [data, setData] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/media')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="noise min-h-screen flex items-center justify-center">
        <div className="text-concrete">Loading...</div>
      </div>
    );
  }

  const photos = data?.photos || [];
  const videos = data?.videos || [];
  const flyers = data?.flyers || [];

  return (
    <div className="noise min-h-screen">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-blood-red/20 to-void-black">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-dirty-white mb-4">
            MEDIA
          </h1>
          <p className="text-xl text-concrete">
            Photos, videos, and visual chaos.
          </p>
        </div>
      </section>

      <div className="divider-slash" />

      {/* Social Links */}
      <Visible path="sections.media.socialLinks">
        <section className="py-12 bg-asphalt-gray">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-display font-bold text-dirty-white mb-6">
              FOLLOW FOR MORE
            </h2>
            <div className="flex flex-wrap gap-4">
              {socials.instagram && (
                <Visible path="elements.buttons.mediaInstagramLink">
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white font-bold uppercase tracking-wider hover:opacity-80 transition-opacity inline-flex items-center gap-2"
                  >
                    <Instagram className="w-5 h-5" />
                    Instagram
                  </a>
                </Visible>
              )}
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#1877F2] px-6 py-3 text-white font-bold uppercase tracking-wider hover:opacity-80 transition-opacity inline-flex items-center gap-2"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </a>
              )}
            </div>
          </div>
        </section>
      </Visible>

      {/* Photos */}
      <Visible path="sections.media.photos">
        <section className="py-16 bg-void-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-dirty-white mb-8 flex items-center gap-4">
              <Camera className="w-8 h-8 text-neon-green" />
              PHOTOS
            </h2>

            {photos.length === 0 ? (
              <Card variant="punk" className="max-w-2xl">
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-blood-red mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-dirty-white mb-2">
                    Photos Coming Soon
                  </h3>
                  <p className="text-concrete mb-6">
                    Check our Instagram for the latest photos from shows and behind the scenes.
                  </p>
                  {socials.instagram && (
                    <a
                      href={socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="punk">
                        <Instagram className="w-4 h-4 mr-2" />
                        View Instagram
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square bg-asphalt-gray border border-concrete hover:border-neon-green transition-colors overflow-hidden cursor-pointer"
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.title || 'Photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </Visible>

      {/* Videos */}
      <Visible path="sections.media.videos">
        <section className="py-16 bg-asphalt-gray">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-dirty-white mb-8 flex items-center gap-4">
              <Video className="w-8 h-8 text-neon-green" />
              VIDEOS
            </h2>

            {videos.length === 0 ? (
              <Card variant="punk" className="max-w-2xl">
                <div className="text-center py-12">
                  <Video className="w-16 h-16 text-blood-red mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-dirty-white mb-2">
                    Videos Coming Soon
                  </h3>
                  <p className="text-concrete">
                    Music videos and live footage coming your way.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <Card key={video.id} variant="punk" hover>
                    <div className="aspect-video bg-void-black mb-4">
                      {/* Video embed would go here */}
                    </div>
                    <h3 className="text-lg font-bold text-dirty-white">
                      {video.title}
                    </h3>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </Visible>

      {/* Flyers */}
      <Visible path="sections.media.flyers">
        <section className="py-16 bg-void-black">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-display font-bold text-dirty-white mb-8 flex items-center gap-4">
              <FileImage className="w-8 h-8 text-neon-green" />
              FLYER ARCHIVE
            </h2>

            {flyers.length === 0 ? (
              <Card variant="punk" className="max-w-2xl">
                <div className="text-center py-12">
                  <FileImage className="w-16 h-16 text-blood-red mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-dirty-white mb-2">
                    Flyers Coming Soon
                  </h3>
                  <p className="text-concrete">
                    Show flyers and artwork will be archived here.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {flyers.map((flyer) => (
                  <div
                    key={flyer.id}
                    className="aspect-[3/4] bg-asphalt-gray border border-concrete hover:border-neon-green transition-colors overflow-hidden cursor-pointer"
                  >
                    <img
                      src={flyer.thumbnailUrl || flyer.url}
                      alt={flyer.title || 'Show flyer'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </Visible>

      {/* Press Kit */}
      <Visible path="sections.media.pressKit">
        <section className="py-16 bg-blood-red">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-display font-bold text-dirty-white mb-4">
              PRESS & PROMOTERS
            </h2>
            <p className="text-dirty-white/80 mb-8 max-w-xl mx-auto">
              Need high-res photos, logos, or press materials?
            </p>
            <Visible path="elements.buttons.mediaPressKit">
              <a href="/contact?type=press">
                <Button variant="outline" className="border-dirty-white text-dirty-white hover:bg-dirty-white hover:text-blood-red">
                  Request Press Kit
                </Button>
              </a>
            </Visible>
          </div>
        </section>
      </Visible>
    </div>
  );
}

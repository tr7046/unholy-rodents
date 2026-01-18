/**
 * Visibility Control System
 *
 * Three-tier hierarchical visibility control:
 * - Level 1: Pages (entire routes)
 * - Level 2: Sections (major content blocks)
 * - Level 3: Elements (buttons, links, individual items)
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface VisibilityConfig {
  pages: PageVisibility;
  navigation: NavigationVisibility;
  sections: SectionsVisibility;
  elements: ElementsVisibility;
}

// Level 1: Page Visibility
export interface PageVisibility {
  home: boolean;
  about: boolean;
  contact: boolean;
  shows: boolean;
  music: boolean;
  media: boolean;
  store: boolean;
}

// Navigation Visibility
export interface NavigationVisibility {
  header: {
    logo: boolean;
    links: {
      shows: boolean;
      music: boolean;
      store: boolean;
      about: boolean;
      contact: boolean;
    };
  };
  footer: {
    visible: boolean;
    brand: boolean;
    socialLinks: {
      instagram: boolean;
      facebook: boolean;
      youtube: boolean;
      spotify: boolean;
    };
    quickLinks: boolean;
    contact: boolean;
    copyright: boolean;
  };
}

// Level 2: Section Visibility (per page)
export interface SectionsVisibility {
  home: {
    hero: boolean;
    marquee: boolean;
    nextShow: boolean;
    latestRelease: boolean;
    socialFeed: boolean;
  };
  about: {
    bio: boolean;
    bandMembers: boolean;
    influences: boolean;
    philosophy: boolean;
    contactCta: boolean;
  };
  contact: {
    info: boolean;
    form: boolean;
    socialLinks: boolean;
  };
  shows: {
    upcoming: boolean;
    past: boolean;
    bookingCta: boolean;
  };
  music: {
    featuredRelease: boolean;
    discography: boolean;
    streamingLinks: boolean;
  };
  media: {
    socialLinks: boolean;
    photos: boolean;
    videos: boolean;
    flyers: boolean;
    pressKit: boolean;
  };
  store: {
    productGrid: boolean;
    filters: boolean;
    cart: boolean;
    freeShippingBanner: boolean;
  };
}

// Level 3: Element Visibility
export interface ElementsVisibility {
  buttons: {
    // Home page
    heroSeeShows: boolean;
    heroListenNow: boolean;
    releaseViewMore: boolean;
    // About page
    aboutContactCta: boolean;
    // Contact page
    contactSendMessage: boolean;
    // Shows page
    showsBookingCta: boolean;
    // Music page
    musicStreamingButtons: boolean;
    // Media page
    mediaInstagramLink: boolean;
    mediaPressKit: boolean;
    // Store page
    storeAddToCart: boolean;
    storeViewCart: boolean;
  };
  features: {
    // Animations
    animations: boolean;
    marqueeScroll: boolean;
    hoverEffects: boolean;
    // Interactive features
    mobileMenu: boolean;
    cartSidebar: boolean;
    productModal: boolean;
    // Form features
    contactFormSubject: boolean;
  };
}

// ============================================
// DEFAULT CONFIGURATION (Everything ON)
// ============================================

export const defaultVisibilityConfig: VisibilityConfig = {
  pages: {
    home: true,
    about: true,
    contact: true,
    shows: true,
    music: true,
    media: true,
    store: true,
  },
  navigation: {
    header: {
      logo: true,
      links: {
        shows: true,
        music: true,
        store: true,
        about: true,
        contact: true,
      },
    },
    footer: {
      visible: true,
      brand: true,
      socialLinks: {
        instagram: true,
        facebook: true,
        youtube: true,
        spotify: true,
      },
      quickLinks: true,
      contact: true,
      copyright: true,
    },
  },
  sections: {
    home: {
      hero: true,
      marquee: true,
      nextShow: true,
      latestRelease: true,
      socialFeed: true,
    },
    about: {
      bio: true,
      bandMembers: true,
      influences: true,
      philosophy: true,
      contactCta: true,
    },
    contact: {
      info: true,
      form: true,
      socialLinks: true,
    },
    shows: {
      upcoming: true,
      past: true,
      bookingCta: true,
    },
    music: {
      featuredRelease: true,
      discography: true,
      streamingLinks: true,
    },
    media: {
      socialLinks: true,
      photos: true,
      videos: true,
      flyers: true,
      pressKit: true,
    },
    store: {
      productGrid: true,
      filters: true,
      cart: true,
      freeShippingBanner: true,
    },
  },
  elements: {
    buttons: {
      heroSeeShows: true,
      heroListenNow: true,
      releaseViewMore: true,
      aboutContactCta: true,
      contactSendMessage: true,
      showsBookingCta: true,
      musicStreamingButtons: true,
      mediaInstagramLink: true,
      mediaPressKit: true,
      storeAddToCart: true,
      storeViewCart: true,
    },
    features: {
      animations: true,
      marqueeScroll: true,
      hoverEffects: true,
      mobileMenu: true,
      cartSidebar: true,
      productModal: true,
      contactFormSubject: true,
    },
  },
};

// ============================================
// HUMAN-READABLE LABELS FOR ADMIN UI
// ============================================

export const visibilityLabels = {
  pages: {
    _title: 'Pages',
    _description: 'Enable or disable entire pages',
    home: { label: 'Home Page', description: 'Main landing page' },
    about: { label: 'About Page', description: 'Band info and members' },
    contact: { label: 'Contact Page', description: 'Contact form and info' },
    shows: { label: 'Shows Page', description: 'Upcoming and past shows' },
    music: { label: 'Music Page', description: 'Releases and streaming links' },
    media: { label: 'Media Page', description: 'Photos, videos, flyers' },
    store: { label: 'Store Page', description: 'Merch and products' },
  },
  navigation: {
    _title: 'Navigation',
    _description: 'Control header and footer elements',
    header: {
      _title: 'Header',
      logo: { label: 'Logo', description: 'UNHOLY RODENTS branding' },
      links: {
        _title: 'Navigation Links',
        shows: { label: 'Shows Link', description: 'Link to shows page' },
        music: { label: 'Music Link', description: 'Link to music page' },
        store: { label: 'Store Link', description: 'Link to store page' },
        about: { label: 'About Link', description: 'Link to about page' },
        contact: { label: 'Contact Link', description: 'Link to contact page' },
      },
    },
    footer: {
      _title: 'Footer',
      visible: { label: 'Show Footer', description: 'Entire footer section' },
      brand: { label: 'Brand Section', description: 'Logo and tagline' },
      socialLinks: {
        _title: 'Social Icons',
        instagram: { label: 'Instagram', description: 'Instagram link' },
        facebook: { label: 'Facebook', description: 'Facebook link' },
        youtube: { label: 'YouTube', description: 'YouTube link' },
        spotify: { label: 'Spotify', description: 'Spotify link' },
      },
      quickLinks: { label: 'Quick Links', description: 'Navigation shortcuts' },
      contact: { label: 'Contact Info', description: 'Email address' },
      copyright: { label: 'Copyright', description: 'Bottom copyright text' },
    },
  },
  sections: {
    _title: 'Page Sections',
    _description: 'Control visibility of major content blocks',
    home: {
      _title: 'Home Page Sections',
      hero: { label: 'Hero Section', description: 'Main banner with title and CTAs' },
      marquee: { label: 'Marquee Banner', description: 'Scrolling text strip' },
      nextShow: { label: 'Next Show', description: 'Upcoming show preview card' },
      latestRelease: { label: 'Latest Release', description: 'Featured album/single' },
      socialFeed: { label: 'Social Feed', description: 'Social media links carousel' },
    },
    about: {
      _title: 'About Page Sections',
      bio: { label: 'Band Bio', description: 'History and story' },
      bandMembers: { label: 'Band Members', description: 'Member cards with photos' },
      influences: { label: 'Influences', description: 'Musical influences list' },
      philosophy: { label: 'Philosophy', description: 'Band ethos cards' },
      contactCta: { label: 'Contact CTA', description: 'Call-to-action block' },
    },
    contact: {
      _title: 'Contact Page Sections',
      info: { label: 'Contact Info', description: 'Email and location cards' },
      form: { label: 'Contact Form', description: 'Message submission form' },
      socialLinks: { label: 'Social Links', description: 'Social media buttons' },
    },
    shows: {
      _title: 'Shows Page Sections',
      upcoming: { label: 'Upcoming Shows', description: 'Future show listings' },
      past: { label: 'Past Shows', description: 'Historical shows archive' },
      bookingCta: { label: 'Booking CTA', description: 'Book us call-to-action' },
    },
    music: {
      _title: 'Music Page Sections',
      featuredRelease: { label: 'Featured Release', description: 'Highlighted album' },
      discography: { label: 'Discography', description: 'All releases list' },
      streamingLinks: { label: 'Streaming Links', description: 'Platform buttons' },
    },
    media: {
      _title: 'Media Page Sections',
      socialLinks: { label: 'Social Links', description: 'Instagram/Facebook buttons' },
      photos: { label: 'Photos', description: 'Photo gallery' },
      videos: { label: 'Videos', description: 'Video gallery' },
      flyers: { label: 'Flyers', description: 'Show flyers archive' },
      pressKit: { label: 'Press Kit', description: 'Press materials section' },
    },
    store: {
      _title: 'Store Page Sections',
      productGrid: { label: 'Product Grid', description: 'Product listings' },
      filters: { label: 'Category Filters', description: 'Filter buttons' },
      cart: { label: 'Shopping Cart', description: 'Cart sidebar' },
      freeShippingBanner: { label: 'Free Shipping Banner', description: 'Shipping promotion' },
    },
  },
  elements: {
    _title: 'Individual Elements',
    _description: 'Fine-grained control over buttons and features',
    buttons: {
      _title: 'Buttons & Links',
      heroSeeShows: { label: 'Hero - See Shows', description: 'Shows button in hero' },
      heroListenNow: { label: 'Hero - Listen Now', description: 'Music button in hero' },
      releaseViewMore: { label: 'View Release', description: 'Album details button' },
      aboutContactCta: { label: 'About - Contact Us', description: 'Contact button on about' },
      contactSendMessage: { label: 'Send Message', description: 'Form submit button' },
      showsBookingCta: { label: 'Book Us', description: 'Booking request button' },
      musicStreamingButtons: { label: 'Streaming Buttons', description: 'Spotify, Apple, etc.' },
      mediaInstagramLink: { label: 'View Instagram', description: 'Instagram gallery link' },
      mediaPressKit: { label: 'Request Press Kit', description: 'Press materials button' },
      storeAddToCart: { label: 'Add to Cart', description: 'Product add buttons' },
      storeViewCart: { label: 'View Cart', description: 'Cart icon button' },
    },
    features: {
      _title: 'Interactive Features',
      animations: { label: 'Animations', description: 'Page animations and transitions' },
      marqueeScroll: { label: 'Marquee Scroll', description: 'Auto-scrolling text' },
      hoverEffects: { label: 'Hover Effects', description: 'Interactive hover states' },
      mobileMenu: { label: 'Mobile Menu', description: 'Hamburger menu on mobile' },
      cartSidebar: { label: 'Cart Sidebar', description: 'Slide-out cart panel' },
      productModal: { label: 'Product Modal', description: 'Product detail popups' },
      contactFormSubject: { label: 'Subject Dropdown', description: 'Contact form subject field' },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a nested value from config using dot notation
 * e.g., getConfigValue(config, 'sections.home.hero')
 */
export function getConfigValue(config: VisibilityConfig, path: string): boolean {
  const parts = path.split('.');
  let value: unknown = config;

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = (value as Record<string, unknown>)[part];
    } else {
      return true; // Default to visible if path not found
    }
  }

  return value === true;
}

/**
 * Set a nested value in config using dot notation
 */
export function setConfigValue(
  config: VisibilityConfig,
  path: string,
  value: boolean
): VisibilityConfig {
  const newConfig = JSON.parse(JSON.stringify(config)) as VisibilityConfig;
  const parts = path.split('.');
  let current: Record<string, unknown> = newConfig as unknown as Record<string, unknown>;

  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]] as Record<string, unknown>;
  }

  current[parts[parts.length - 1]] = value;
  return newConfig;
}

/**
 * Check if a page should be accessible in navigation
 */
export function isPageAccessible(config: VisibilityConfig, page: keyof PageVisibility): boolean {
  return config.pages[page] && config.navigation.header.links[page as keyof typeof config.navigation.header.links];
}

/**
 * Get all disabled pages (for 404 redirects)
 */
export function getDisabledPages(config: VisibilityConfig): string[] {
  return Object.entries(config.pages)
    .filter(([, enabled]) => !enabled)
    .map(([page]) => `/${page === 'home' ? '' : page}`);
}

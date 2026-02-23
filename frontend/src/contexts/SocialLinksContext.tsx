'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
  spotify: string;
  tiktok: string;
  twitter: string;
  bandcamp: string;
}

const defaultLinks: SocialLinks = {
  instagram: '',
  facebook: '',
  youtube: '',
  spotify: '',
  tiktok: '',
  twitter: '',
  bandcamp: '',
};

const SocialLinksContext = createContext<SocialLinks>(defaultLinks);

export function useSocialLinks() {
  return useContext(SocialLinksContext);
}

export function SocialLinksProvider({ children }: { children: ReactNode }) {
  const [links, setLinks] = useState<SocialLinks>(defaultLinks);

  useEffect(() => {
    fetch('/api/public/socials')
      .then((res) => (res.ok ? res.json() : defaultLinks))
      .then(setLinks)
      .catch(() => {});
  }, []);

  return (
    <SocialLinksContext.Provider value={links}>
      {children}
    </SocialLinksContext.Provider>
  );
}

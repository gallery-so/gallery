import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useReportError } from 'shared/contexts/ErrorReportingContext';

import { fetchSanityContent } from '~/utils/sanity';

type Announcement = {
  internal_id: string;
  active: boolean;
  title: string;
  description: string;
  imageUrl: string;
  platform: string;
  ctaText?: string;
};

type SanityAnnouncementContextType = {
  announcement: Announcement | null;
  fetchAnnouncement: () => void;
  hasSeenAnnouncement: boolean;
  hasDismissedAnnouncement: boolean;
  markAnnouncementAsSeen: () => void;
  dismissAnnouncement: () => void;
};

const SanityAnnouncementContext = createContext<SanityAnnouncementContextType | undefined>(
  undefined
);
export function useSanityAnnouncementContext() {
  const value = useContext(SanityAnnouncementContext);

  if (!value) {
    throw new Error('Tried to use SanityAnnouncementContext without a Provider');
  }

  return value;
}

export const SanityAnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [hasDismissedAnnouncement, setHasDismissedAnnouncement] = useState(false);
  const [hasSeenAnnouncement, setHasSeenAnnouncement] = useState(false);

  const reportError = useReportError();

  const checkDismissalStatus = useCallback(
    async (internalId: string) => {
      try {
        const dismissed = window.localStorage.getItem(`${internalId}-hasDismissedAnnouncement`);
        setHasDismissedAnnouncement(dismissed === 'true');
      } catch (error) {
        reportError('An error occurred while checking announcement dismissal status');
      }
    },
    [reportError]
  );

  const checkSeenStatus = useCallback(
    async (internalId: string) => {
      try {
        const seen = window.localStorage.getItem(`${internalId}-hasSeenAnnouncement`);
        setHasSeenAnnouncement(seen === 'true');
      } catch (error) {
        reportError('An error occurred while checking announcement seen status');
      }
    },
    [reportError]
  );

  const fetchAnnouncement = useCallback(async () => {
    try {
      const result = await fetchSanityContent(
        `*[_type == "announcementNotification" && active == true && (platform == "Web" || platform == "All")] {
              internal_id,
              active,
              title,
              description,
              "imageUrl": image.asset->url,
              platform,
            } | order(_createdAt desc)[0]`
      );

      setAnnouncement(result);
      if (result) {
        checkDismissalStatus(result.internal_id);
        checkSeenStatus(result.internal_id);
      }
    } catch (error) {
      if (error instanceof Error) {
        reportError(error);
      } else {
        reportError('An error occurred while fetching announcement from Sanity');
      }
    }
  }, [checkDismissalStatus, checkSeenStatus, reportError]);

  const dismissAnnouncement = useCallback(async () => {
    if (announcement && announcement.internal_id) {
      window.localStorage.setItem(`${announcement.internal_id}-hasDismissedAnnouncement`, 'true');
      setHasDismissedAnnouncement(true);
    }
  }, [announcement]);

  const markAnnouncementAsSeen = useCallback(async () => {
    if (announcement && announcement.internal_id) {
      window.localStorage.setItem(`${announcement.internal_id}-hasSeenAnnouncement`, 'true');
      setHasSeenAnnouncement(true);
    }
  }, [announcement]);

  useEffect(() => {
    fetchAnnouncement();
    // Only run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => {
    return {
      announcement,
      fetchAnnouncement,
      hasDismissedAnnouncement,
      dismissAnnouncement,
      hasSeenAnnouncement,
      markAnnouncementAsSeen,
    };
  }, [
    announcement,
    dismissAnnouncement,
    fetchAnnouncement,
    hasDismissedAnnouncement,
    hasSeenAnnouncement,
    markAnnouncementAsSeen,
  ]);

  return (
    <SanityAnnouncementContext.Provider value={value}>
      {children}
    </SanityAnnouncementContext.Provider>
  );
};

import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { fetchSanityContent } from 'src/utils/sanity';
import { useEffectOnAppForeground } from 'src/utils/useEffectOnAppForeground';

type Announcement = {
  internal_id: string;
  active: boolean;
  title: string;
  description: string;
  imageUrl: string;
  platform: string;
  min_mobile_version: number;
  ctaText?: string;
};

type AnnouncementContextType = {
  announcement: Announcement | null;
  fetchAnnouncement: () => void;
  hasSeenAnnouncement: boolean;
  hasDismissedAnnouncement: boolean;
  markAnnouncementAsSeen: () => void;
  dismissAnnouncement: () => void;
};

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export function useAnnouncementContext() {
  const value = useContext(AnnouncementContext);

  if (!value) {
    throw new Error('Tried to use AnnouncementContext without a Provider');
  }

  return value;
}

export const AnnouncementProvider = ({ children }: { children: ReactNode[] }) => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [hasDismissedAnnouncement, setHasDismissedAnnouncement] = useState(false);
  const [hasSeenAnnouncement, setHasSeenAnnouncement] = useState(false);

  const reportError = useReportError();

  const checkDismissalStatus = useCallback(
    async (internalId: string) => {
      try {
        const dismissed = await AsyncStorage.getItem(`hasDismissedAnnouncement-${internalId}`);
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
        const seen = await AsyncStorage.getItem(`hasSeenAnnouncement-${internalId}`);
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
        `*[_type == "announcementNotification" && active == true] {
              internal_id,
              active,
              title,
              description,
              "imageUrl": image.asset->url,
              platform,
              min_mobile_version
            } | order(_createdAt desc)[0]`
      );
      if (result) {
        setAnnouncement(result);
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

  useEffectOnAppForeground(fetchAnnouncement);

  // Function to dismiss an announcement
  const dismissAnnouncement = useCallback(async () => {
    if (announcement && announcement.internal_id) {
      await AsyncStorage.setItem(`hasDismissedAnnouncement-${announcement.internal_id}`, 'true');
      setHasDismissedAnnouncement(true);
    }
  }, [announcement]);

  const markAnnouncementAsSeen = useCallback(async () => {
    if (announcement && announcement.internal_id) {
      await AsyncStorage.setItem(`hasSeenAnnouncement-${announcement.internal_id}`, 'true');
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

  return <AnnouncementContext.Provider value={value}>{children}</AnnouncementContext.Provider>;
};

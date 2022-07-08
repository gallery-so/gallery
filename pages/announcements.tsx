import { FEED_ANNOUNCEMENT_STORAGE_KEY } from 'constants/storageKeys';
import GlobalAnnouncementPopover from 'contexts/globalLayout/GlobalAnnouncementPopover/GlobalAnnouncementPopover';
import usePersistedState from 'hooks/usePersistedState';
import { useEffect } from 'react';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Announcements() {
  const [, setDismissed] = usePersistedState(FEED_ANNOUNCEMENT_STORAGE_KEY, false);

  useEffect(() => {
    setDismissed(true);
  }, [setDismissed]);

  return <GalleryRoute element={<GlobalAnnouncementPopover />} navbar={false} footer={false} />;
}

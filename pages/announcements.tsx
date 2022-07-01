import { FEED_ANNOUNCEMENT_STORAGE_KEY } from 'constants/storageKeys';
import GlobalAnnouncementPopover from 'contexts/globalLayout/GlobalAnnouncementPopover/GlobalAnnouncementPopover';
import usePersistedState from 'hooks/usePersistedState';
import { useEffect } from 'react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Announcements() {
  const query = useLazyLoadQuery<any>(
    graphql`
      query announcementsQuery {
        ...GlobalAnnouncementPopover
      }
    `,
    {}
  );

  const [, setDismissed] = usePersistedState(FEED_ANNOUNCEMENT_STORAGE_KEY, false);

  useEffect(() => {
    setDismissed(true);
  }, [setDismissed]);

  return (
    <GalleryRoute
      element={<GlobalAnnouncementPopover queryRef={query} />}
      navbar={false}
      footer={false}
    />
  );
}

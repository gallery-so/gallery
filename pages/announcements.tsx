import { TEZOS_ANNOUNCEMENT_STORAGE_KEY } from 'constants/storageKeys';
import GlobalAnnouncementPopover from 'contexts/globalLayout/GlobalAnnouncementPopover/GlobalAnnouncementPopover';
import usePersistedState from 'hooks/usePersistedState';
import { useEffect } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { announcementsQuery } from '__generated__/announcementsQuery.graphql';

export default function Announcements() {
  const [, setDismissed] = usePersistedState(TEZOS_ANNOUNCEMENT_STORAGE_KEY, false);

  const query = useLazyLoadQuery<announcementsQuery>(
    graphql`
      query announcementsQuery {
        ...GlobalAnnouncementPopoverFragment
      }
    `,
    {}
  );

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

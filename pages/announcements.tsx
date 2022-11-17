import { useEffect } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { TEZOS_ANNOUNCEMENT_STORAGE_KEY } from '~/constants/storageKeys';
import GlobalAnnouncementPopover, {
  FEATURED_COLLECTION_IDS,
} from '~/contexts/globalLayout/GlobalAnnouncementPopover/GlobalAnnouncementPopover';
import { announcementsQuery } from '~/generated/announcementsQuery.graphql';
import usePersistedState from '~/hooks/usePersistedState';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';

export default function Announcements() {
  const [, setDismissed] = usePersistedState(TEZOS_ANNOUNCEMENT_STORAGE_KEY, false);

  const query = useLazyLoadQuery<announcementsQuery>(
    graphql`
      query announcementsQuery($collectionIds: [DBID!]!) {
        ...GlobalAnnouncementPopoverFragment
      }
    `,
    { collectionIds: FEATURED_COLLECTION_IDS }
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

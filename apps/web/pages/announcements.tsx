import { useEffect } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import GlobalAnnouncementPopover, {
  FEATURED_COLLECTION_IDS,
} from '~/contexts/globalLayout/GlobalAnnouncementPopover/GlobalAnnouncementPopover';
import { announcementsQuery } from '~/generated/announcementsQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';

export default function Announcements() {
  const query = useLazyLoadQuery<announcementsQuery>(
    graphql`
      query announcementsQuery($collectionIds: [DBID!]!) {
        ...GlobalAnnouncementPopoverFragment
        ...isExperienceDismissedFragment
      }
    `,
    { collectionIds: FEATURED_COLLECTION_IDS }
  );

  // const updateUserExperience = useUpdateUserExperience();

  useEffect(() => {
    // TODO next time we do a full-page announcement, create a new Experience flag and set it here
    // updateUserExperience({
    //   type: 'YourExperienceFlagHere',
    //   experienced: true,
    // })
  }, []);

  return (
    <GalleryRoute
      element={<GlobalAnnouncementPopover queryRef={query} />}
      navbar={false}
      footer={false}
    />
  );
}

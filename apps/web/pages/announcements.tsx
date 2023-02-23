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
        # ...useExperienceFragment
      }
    `,
    { collectionIds: FEATURED_COLLECTION_IDS }
  );

  // TODO next time we do a full-page announcement, create a new Experience flag and set it here
  // const [, updateGlobalAnnouncementExperienced] = useExperience({
  //   type: 'YourGlobalAnnouncementFlagHere',
  //   queryRef: query,
  // })
  // const handleDismissGlobalAnnouncement = useCallback(async () => {
  //   return await updateGlobalAnnouncementExperienced({ experienced: true })
  // }, [updateGlobalAnnouncementExperienced])

  useEffect(() => {
    // handleDismissGlobalAnnouncement()
  }, []);

  return (
    <GalleryRoute
      element={<GlobalAnnouncementPopover queryRef={query} />}
      navbar={false}
      footer={false}
    />
  );
}

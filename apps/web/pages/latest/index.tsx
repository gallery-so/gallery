import { graphql, useLazyLoadQuery } from 'react-relay';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import { HomeNavbar } from '~/contexts/globalLayout/GlobalNavbar/HomeNavbar/HomeNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { latestQuery } from '~/generated/latestQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { LatestHomePage } from '~/scenes/Home/Latest/LatestHomePage';

export default function Latest() {
  const query = useLazyLoadQuery<latestQuery>(
    graphql`
      query latestQuery(
        $latestBefore: String
        $latestLast: Int!
        $interactionsFirst: Int!
        $interactionsAfter: String
        $visibleTokensPerFeedEvent: Int!
      ) {
        ...LatestHomePageFragment
        ...HomeNavbarFragment
        ...StandardSidebarFragment
      }
    `,
    {
      latestLast: ITEMS_PER_PAGE,
      visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
      interactionsFirst: NOTES_PER_PAGE,
    }
  );

  return (
    <GalleryRoute
      element={<LatestHomePage queryRef={query} />}
      navbar={<HomeNavbar queryRef={query} />}
      sidebar={<StandardSidebar queryRef={query} />}
    />
  );
}

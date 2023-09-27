import { graphql, loadQuery, PreloadedQuery, usePreloadedQuery } from 'react-relay';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { HomeNavbar } from '~/contexts/globalLayout/GlobalNavbar/HomeNavbar/HomeNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { latestQuery } from '~/generated/latestQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { LatestHomePage } from '~/scenes/Home/Latest/LatestHomePage';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';

const latestQueryNode = graphql`
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
`;

type Props = {
  preloadedQuery: PreloadedQuery<latestQuery>;
};

export default function Latest({ preloadedQuery }: Props) {
  const query = usePreloadedQuery<latestQuery>(latestQueryNode, preloadedQuery);

  return (
    <GalleryRoute
      element={<LatestHomePage queryRef={query} />}
      navbar={<HomeNavbar queryRef={query} />}
      sidebar={<StandardSidebar queryRef={query} />}
    />
  );
}

Latest.preloadQuery = ({ relayEnvironment }: PreloadQueryArgs) => {
  return loadQuery(
    relayEnvironment,
    latestQueryNode,
    {
      latestLast: ITEMS_PER_PAGE,
      visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
      interactionsFirst: NOTES_PER_PAGE,
      includePosts: true,
    },
    { fetchPolicy: 'store-or-network' }
  );
};

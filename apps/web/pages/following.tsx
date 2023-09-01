import { graphql, useLazyLoadQuery } from 'react-relay';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/CommentsModal/CommentsModal';
import { HomeNavbar } from '~/contexts/globalLayout/GlobalNavbar/HomeNavbar/HomeNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { followingQuery } from '~/generated/followingQuery.graphql';
import GalleryRedirect from '~/scenes/_Router/GalleryRedirect';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { LatestFollowingPage } from '~/scenes/Home/Latest/LatestFollowingPage';

export default function Following() {
  const query = useLazyLoadQuery<followingQuery>(
    graphql`
      query followingQuery(
        $latestFollowingBefore: String
        $latestFollowingLast: Int!
        $interactionsFirst: Int!
        $interactionsAfter: String
        $visibleTokensPerFeedEvent: Int!
      ) {
        ...HomeNavbarFragment
        ...LatestFollowingPageFragment
        ...StandardSidebarFragment
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    {
      latestFollowingLast: ITEMS_PER_PAGE,
      visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
      interactionsFirst: NOTES_PER_PAGE,
    }
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  if (!isAuthenticated) {
    return <GalleryRedirect to={{ pathname: '/home' }} />;
  }

  return (
    <GalleryRoute
      element={<LatestFollowingPage queryRef={query} />}
      navbar={<HomeNavbar queryRef={query} />}
      sidebar={<StandardSidebar queryRef={query} />}
    />
  );
}

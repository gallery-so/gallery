import { FeatureFlag } from 'components/core/enums';
import { ITEMS_PER_PAGE } from 'components/Feed/constants';
import { graphql, useLazyLoadQuery } from 'react-relay';
import HomeScene from 'scenes/Home/Home';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';
import { homeQuery } from '__generated__/homeQuery.graphql';

export default function Home() {
  const query = useLazyLoadQuery<homeQuery>(
    graphql`
      query homeQuery(
        $globalLast: Int!
        $globalBefore: String
        $viewerFirst: Int!
        $viewerAfter: String
      ) {
        ...isFeatureEnabledFragment

        ...HomeFragment
      }
    `,
    {
      globalLast: ITEMS_PER_PAGE,
      viewerFirst: ITEMS_PER_PAGE,
    }
  );

  if (!isFeatureEnabled(FeatureFlag.FEED, query)) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<HomeScene queryRef={query} />} navbar={true} />;
}

/**
 * Wacky bugfix that addresses a bizarre inconsistency in the NextJS router.
 *
 * If a page *does not* export `getServerSideProps`, returning to the page triggers a
 * NextJS route change BEFORE the browser believes it has transitioned via `window.popState`.
 *
 * However, exporting `getServerSideProps` for some reason ensures the browser's `popState`
 * fires BEFORE the NextJS route change, which is necessary behavior for our FadeTransitioner.
 * This is because our FadeTransitioner depends on listening to the `popState` signal to
 * schedule a graceful scroll restoration before the transition begins.
 *
 * To summarize:
 *
 * WITHOUT getServerSideProps:
 *   1) click back button
 *   2) nextJS route change
 *   3) transition begins
 *   4) immediately visible scroll jank
 *   5) browser popState fires late
 *   6) transition ends
 *
 * WITH    getServerSideProps:
 *   1) click back button
 *   2) browser popState fires
 *   3) scroll position is scheduled to fire later
 *   4) nextJS route change
 *   5) transition begins
 *   6) scroll restoration while screen is opaque (jank is invisible to user)
 *   7) transition ends
 */
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};

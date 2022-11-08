import { useEffect } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { FeedMode } from '~/components/Feed/Feed';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import { FEED_MODE_KEY } from '~/constants/storageKeys';
import { FeedNavbar } from '~/contexts/globalLayout/GlobalNavbar/FeedNavbar/FeedNavbar';
import { homeQuery } from '~/generated/homeQuery.graphql';
import usePersistedState from '~/hooks/usePersistedState';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import HomeScene from '~/scenes/Home/Home';

export default function Home() {
  const query = useLazyLoadQuery<homeQuery>(
    graphql`
      query homeQuery(
        $interactionsFirst: Int!
        $interactionsAfter: String
        $globalLast: Int!
        $globalBefore: String
        $viewerLast: Int!
        $viewerBefore: String
        $visibleTokensPerFeedEvent: Int!
      ) {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }

        ...HomeFragment
        ...FeedNavbarFragment
      }
    `,
    {
      interactionsFirst: NOTES_PER_PAGE,
      globalLast: ITEMS_PER_PAGE,
      viewerLast: ITEMS_PER_PAGE,
      visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
    }
  );

  const { viewer } = query;
  const viewerUserId = viewer?.user?.dbid ?? '';
  const defaultFeedMode = viewerUserId ? 'FOLLOWING' : 'WORLDWIDE';

  const [feedMode, setFeedMode] = usePersistedState<FeedMode>(FEED_MODE_KEY, defaultFeedMode);

  // This effect handles adding and removing the Feed controls on the navbar when mounting this component, and signing in+out while on the Feed page.
  useEffect(() => {
    if (!viewerUserId) {
      setFeedMode('WORLDWIDE');
    }
  }, [viewerUserId, feedMode, setFeedMode]);

  return (
    <GalleryRoute
      navbar={<FeedNavbar feedMode={feedMode} onChange={setFeedMode} queryRef={query} />}
      element={<HomeScene setFeedMode={setFeedMode} feedMode={feedMode} queryRef={query} />}
    />
  );
}

Home.preloadQuery = ({ relayEnvironment }: PreloadQueryArgs) => {
  fetchQuery<homeQuery>(relayEnvironment, homeQueryNode, {
    interactionsFirst: NOTES_PER_PAGE,
    globalLast: ITEMS_PER_PAGE,
    viewerLast: ITEMS_PER_PAGE,
  }).toPromise();
};

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

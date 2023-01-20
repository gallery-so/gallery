import { useState } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { fetchQuery } from 'relay-runtime';

import { ITEMS_PER_PAGE, MAX_PIECES_DISPLAYED_PER_FEED_EVENT } from '~/components/Feed/constants';
import { NOTES_PER_PAGE } from '~/components/Feed/Socialize/NotesModal/NotesModal';
import { HOME_MODE, HomeNavbar } from '~/contexts/globalLayout/GlobalNavbar/HomeNavbar/HomeNavbar';
import { homeQuery } from '~/generated/homeQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import HomeScene from '~/scenes/Home/Home';
import useOpenSettingsModal from '~/scenes/Modals/useOpenSettingsModal';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';

const homeQueryNode = graphql`
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
    ...HomeNavbarFragment
    ...useOpenSettingsModalFragment
  }
`;

export default function Home() {
  const query = useLazyLoadQuery<homeQuery>(homeQueryNode, {
    interactionsFirst: NOTES_PER_PAGE,
    globalLast: ITEMS_PER_PAGE,
    viewerLast: ITEMS_PER_PAGE,
    visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
  });

  const [homeMode, setHomeMode] = useState<HOME_MODE>('ACTIVITY');

  useOpenSettingsModal(query);

  return (
    <GalleryRoute
      navbar={<HomeNavbar queryRef={query} homeMode={homeMode} setHomeMode={setHomeMode} />}
      element={<HomeScene queryRef={query} homeMode={homeMode} />}
    />
  );
}

Home.preloadQuery = ({ relayEnvironment }: PreloadQueryArgs) => {
  fetchQuery<homeQuery>(relayEnvironment, homeQueryNode, {
    interactionsFirst: NOTES_PER_PAGE,
    globalLast: ITEMS_PER_PAGE,
    viewerLast: ITEMS_PER_PAGE,
    visibleTokensPerFeedEvent: MAX_PIECES_DISPLAYED_PER_FEED_EVENT,
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

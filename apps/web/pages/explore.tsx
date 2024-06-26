import { graphql, useLazyLoadQuery } from 'react-relay';

import { HomeNavbar } from '~/contexts/globalLayout/GlobalNavbar/HomeNavbar/HomeNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { exploreQuery } from '~/generated/exploreQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import { CmsTypes } from '~/scenes/ContentPages/cms_types';
import ExplorePage from '~/scenes/Home/ExploreHomePage';
import { fetchSanityContent } from '~/utils/sanity';

type Props = {
  gallerySelectsContent: CmsTypes.ExplorePageGallerySelectsList;
};

export default function Explore({ gallerySelectsContent }: Props) {
  const query = useLazyLoadQuery<exploreQuery>(
    graphql`
      query exploreQuery {
        ...HomeNavbarFragment
        ...StandardSidebarFragment
      }
    `,
    {}
  );

  return (
    <GalleryRoute
      navbar={<HomeNavbar queryRef={query} />}
      sidebar={<StandardSidebar queryRef={query} />}
      element={<ExplorePage gallerySelectsContent={gallerySelectsContent} />}
    />
  );
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
  const content = await fetchSanityContent(`*[_type == "explorePageGallerySelectsList"]{
    "articleList": articleList[]->{
      coverImage{
        asset->{
          url
        },
        alt
      },
      title,
      previewText,
      articleUrl
    }
  }`);

  return {
    props: {
      gallerySelectsContent: content[0],
    },
  };
};

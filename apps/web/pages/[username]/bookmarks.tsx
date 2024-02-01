import { GetServerSideProps } from 'next';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import GalleryViewEmitter from 'shared/components/GalleryViewEmitter';

import BookmarkedTokenGrid from '~/components/Bookmarks/BookmarkedTokenGrid';
import { VStack } from '~/components/core/Spacer/Stack';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { bookmarksPageFragment$key } from '~/generated/bookmarksPageFragment.graphql';
import { bookmarksQuery } from '~/generated/bookmarksQuery.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserGalleryHeader from '~/scenes/UserGalleryPage/UserGalleryHeader';
import { COMMUNITIES_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedCommunities';
import { FOLLOWERS_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfoList/SharedFollowersList';

import { GalleryPageSpacing } from '.';

type BookmarksPageProps = {
  queryRef: bookmarksPageFragment$key;
};

export const BOOKMARKS_PER_PAGE = 12;

function BookmarksPage({ queryRef }: BookmarksPageProps) {
  const query = useFragment(
    graphql`
      fragment bookmarksPageFragment on Query {
        userByUsername(username: $username) @required(action: THROW) {
          ... on GalleryUser {
            ...UserGalleryHeaderFragment
            ...BookmarkedTokenGridFragment
          }
        }

        ...UserGalleryHeaderQueryFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  return (
    <GalleryPageSpacing>
      <VStack gap={isMobile ? 0 : 24}>
        <UserGalleryHeader userRef={query.userByUsername} queryRef={query} />
        <VStack align="center">
          <BookmarkedTokenGrid userRef={query.userByUsername} />
        </VStack>
      </VStack>
    </GalleryPageSpacing>
  );
}

type BookmarksProps = {
  username: string;
};

export default function Bookmarks({ username }: BookmarksProps) {
  const query = useLazyLoadQuery<bookmarksQuery>(
    graphql`
      query bookmarksQuery(
        $username: String!
        $sharedCommunitiesFirst: Int
        $sharedCommunitiesAfter: String
        $sharedFollowersFirst: Int
        $sharedFollowersAfter: String
        $bookmarksFirst: Int
        $bookmarksAfter: String
      ) {
        ...GalleryNavbarFragment
        ...GalleryViewEmitterWithSuspenseFragment
        ...StandardSidebarFragment
        ...bookmarksPageFragment
      }
    `,
    {
      username,
      sharedCommunitiesFirst: COMMUNITIES_PER_PAGE,
      sharedFollowersFirst: FOLLOWERS_PER_PAGE,
      bookmarksFirst: BOOKMARKS_PER_PAGE,
    }
  );

  return (
    <GalleryRoute
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <BookmarksPage queryRef={query} />
        </>
      }
      navbar={<GalleryNavbar galleryRef={null} username={username} queryRef={query} />}
      sidebar={<StandardSidebar queryRef={query} />}
      footer={false}
    />
  );
}
export const getServerSideProps: GetServerSideProps<BookmarksProps> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: '/',
      },
    };

  return {
    props: {
      username,
    },
  };
};

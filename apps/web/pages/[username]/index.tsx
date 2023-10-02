import { GetServerSideProps } from 'next';
import { route } from 'nextjs-routes';
import { PropsWithChildren } from 'react';
import { loadQuery, PreloadedQuery, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import useVerifyEmailOnPage from '~/components/Email/useVerifyEmailOnPage';
import { GalleryNavbar } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GalleryNavbar';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import { UsernameQuery } from '~/generated/UsernameQuery.graphql';
import { MetaTagProps } from '~/pages/_app';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import UserGalleryPage from '~/scenes/UserGalleryPage/UserGalleryPage';
import { COMMUNITIES_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedCommunities';
import { FOLLOWERS_PER_PAGE } from '~/scenes/UserGalleryPage/UserSharedInfo/UserSharedInfoList/SharedFollowersList';
import GalleryViewEmitter from '~/shared/components/GalleryViewEmitter';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';
import { openGraphMetaTags } from '~/utils/openGraphMetaTags';

const UsernameQueryNode = graphql`
  query UsernameQuery(
    $username: String!
    $sharedCommunitiesFirst: Int
    $sharedCommunitiesAfter: String
    $sharedFollowersFirst: Int
    $sharedFollowersAfter: String
    $viewerLast: Int
    $viewerBefore: String
  ) {
    userByUsername(username: $username) @required(action: THROW) {
      ... on GalleryUser {
        featuredGallery @required(action: THROW) {
          ...GalleryNavbarGalleryFragment
        }
      }
    }

    ...UserGalleryPageFragment
    ...GalleryNavbarFragment
    ...GalleryViewEmitterWithSuspenseFragment
    ...useVerifyEmailOnPageQueryFragment
    ...StandardSidebarFragment

    # [GAL-3763] Revive this if / when elon lets us import twitter follower graphs again
    # ...useOpenTwitterFollowingModalFragment
  }
`;

// This component exists here since all child routes of this page (/{username}/*)
// will be using this wrapper.
// In the future (Next 13 App Directory), we can just use a layout file
export function GalleryPageSpacing({ children }: PropsWithChildren) {
  const navbarHeight = useGlobalNavbarHeight();

  return (
    <GalleryPageSpacingContainer navbarHeight={navbarHeight}>
      <GalleryPageSpacingInner>{children}</GalleryPageSpacingInner>
    </GalleryPageSpacingContainer>
  );
}

const GalleryPageSpacingInner = styled.div`
  max-width: 1200px;
  width: 100%;
`;

const GalleryPageSpacingContainer = styled.div<{ navbarHeight: number }>`
  display: flex;
  justify-content: center;
  min-height: 100vh;

  margin: 0 ${pageGutter.mobile}px 24px;
  padding-top: ${({ navbarHeight }) => navbarHeight + 10}px;

  @media only screen and ${breakpoints.tablet} {
    margin: 0 ${pageGutter.tablet}px;
    padding: ${({ navbarHeight }) => navbarHeight + 24}px 0px;
  }
`;

type UserGalleryProps = MetaTagProps & {
  username: string;
  preloadedQuery: PreloadedQuery<UsernameQuery>;
};

export default function UserGallery({ username, preloadedQuery }: UserGalleryProps) {
  const query = usePreloadedQuery<UsernameQuery>(UsernameQueryNode, preloadedQuery);

  useVerifyEmailOnPage(query);

  // [GAL-3763] Revive this if / when elon lets us import twitter follower graphs again
  // useOpenTwitterFollowingModal(query);

  return (
    <GalleryRoute
      navbar={
        query.userByUsername.featuredGallery ? (
          <GalleryNavbar
            username={username}
            queryRef={query}
            galleryRef={query.userByUsername.featuredGallery}
          />
        ) : (
          false
        )
      }
      sidebar={<StandardSidebar queryRef={query} />}
      element={
        <>
          <GalleryViewEmitter queryRef={query} />
          <UserGalleryPage username={username} queryRef={query} />
        </>
      }
    />
  );
}

UserGallery.preloadQuery = ({ relayEnvironment, query }: PreloadQueryArgs) => {
  if (query.username && typeof query.username === 'string') {
    return loadQuery<UsernameQuery>(
      relayEnvironment,
      UsernameQueryNode,
      {
        username: query.username,
        sharedCommunitiesFirst: COMMUNITIES_PER_PAGE,
        sharedFollowersFirst: FOLLOWERS_PER_PAGE,
        viewerLast: 1,
        // [GAL-3763] Revive this if / when elon lets us import twitter follower graphs again
        // twitterListFirst: USER_PER_PAGE,
      },
      { fetchPolicy: 'store-or-network' }
    );
  }
};

export const getServerSideProps: GetServerSideProps<
  Omit<UserGalleryProps, 'preloadedQuery'>
> = async ({ params }) => {
  const username = params?.username ? (params.username as string) : undefined;

  if (!username)
    return {
      redirect: {
        permanent: false,
        destination: route({ pathname: '/' }),
      },
    };

  return {
    props: {
      username,
      metaTags: username
        ? openGraphMetaTags({
            title: `${username} | Gallery`,
            previewPath: `/opengraph/user/${username}`,
          })
        : null,
    },
  };
};

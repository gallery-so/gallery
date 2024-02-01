import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { GalleryNavLinksFragment$key } from '~/generated/GalleryNavLinksFragment.graphql';
import { GalleryNavLinksQueryFragment$key } from '~/generated/GalleryNavLinksQueryFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { NavbarLink } from '../NavbarLink';

type Props = {
  username: string;
  userRef: GalleryNavLinksFragment$key;
  queryRef: GalleryNavLinksQueryFragment$key;
};

export function GalleryNavLinks({ username, userRef, queryRef }: Props) {
  const user = useFragment(
    graphql`
      fragment GalleryNavLinksFragment on GalleryUser {
        dbid
        galleries {
          __typename
          hidden
        }
        followers {
          __typename
        }
        # Arbitrarily grabbing one item from the feed just so we can grab the total (pageInfo.total)
        feed(before: null, last: 1) @connection(key: "GalleryNavLinksFragment_feed") {
          # Relay doesn't allow @connection w/o edges so we must query for it
          # eslint-disable-next-line relay/unused-fields
          edges {
            __typename
          }
          pageInfo {
            total
          }
        }
        bookmarksCount: tokensBookmarked(first: 1, after: null)
          @connection(key: "GalleryNavLinksFragment_bookmarksCount") {
          edges {
            __typename
          }
          pageInfo {
            total
          }
        }
      }
    `,
    userRef
  );

  const query = useFragment(
    graphql`
      fragment GalleryNavLinksQueryFragment on Query {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    queryRef
  );

  const isViewingSignedInUser = useMemo(() => {
    return Boolean(
      query.viewer &&
        'user' in query.viewer &&
        query.viewer?.user?.dbid &&
        query.viewer?.user?.dbid === user.dbid
    );
  }, [query.viewer, user.dbid]);

  const totalFollowers = user.followers?.length ?? 0;
  const totalGalleries = useMemo(() => {
    return (
      removeNullValues(user.galleries?.map((gallery) => (gallery?.hidden ? null : gallery)))
        .length ?? 0
    );
  }, [user.galleries]);
  const totalPosts = user?.feed?.pageInfo?.total ?? 0;
  const totalBookmarks = user?.bookmarksCount?.pageInfo?.total ?? 0;

  const { pathname } = useRouter();

  const featuredRoute: Route = { pathname: '/[username]', query: { username } };
  const galleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };
  const followersRoute: Route = { pathname: '/[username]/followers', query: { username } };
  const postsRoute: Route = { pathname: '/[username]/posts', query: { username } };
  const bookmarksRoute: Route = { pathname: '/[username]/bookmarks', query: { username } };

  return (
    <HStack gap={8}>
      <NavbarLink
        to={featuredRoute}
        active={pathname === featuredRoute.pathname}
        eventElementId="Gallery Navbar Link"
        eventName="Gallery Navbar Link Click"
        properties={{ tab: 'featured' }}
        eventContext={contexts.UserGallery}
      >
        <HStack gap={4} align="baseline">
          <span>Featured</span>
        </HStack>
      </NavbarLink>

      <NavbarLink
        to={galleriesRoute}
        active={pathname === galleriesRoute.pathname}
        eventElementId="Gallery Navbar Link"
        eventName="Gallery Navbar Link Click"
        properties={{ tab: 'galleries' }}
        eventContext={contexts.UserGallery}
      >
        <HStack gap={4} align="baseline">
          <span>Galleries</span>
          {totalGalleries > 0 && <BaseS>{totalGalleries}</BaseS>}
        </HStack>
      </NavbarLink>

      <NavbarLink
        to={postsRoute}
        active={pathname === postsRoute.pathname}
        eventElementId="Gallery Navbar Link"
        eventName="Gallery Navbar Link Click"
        properties={{ tab: 'posts' }}
        eventContext={contexts.UserGallery}
      >
        <HStack gap={4} align="baseline">
          <span>Posts</span>
          {totalPosts > 0 && <BaseS>{totalPosts}</BaseS>}
        </HStack>
      </NavbarLink>

      {isViewingSignedInUser && (
        <NavbarLink
          to={bookmarksRoute}
          active={pathname === bookmarksRoute.pathname}
          eventElementId="Gallery Navbar Link"
          eventName="Gallery Navbar Link Click"
          properties={{ tab: 'bookmarks' }}
          eventContext={contexts.UserGallery}
        >
          <HStack gap={4} align="baseline">
            <span>Bookmarks</span>
            {totalBookmarks > 0 && <BaseS>{totalBookmarks}</BaseS>}
          </HStack>
        </NavbarLink>
      )}

      <NavbarLink
        to={followersRoute}
        active={pathname === followersRoute.pathname}
        eventElementId="Gallery Navbar Link"
        eventName="Gallery Navbar Link Click"
        properties={{ tab: 'followers' }}
        eventContext={contexts.UserGallery}
      >
        <HStack gap={4} align="baseline">
          Followers
          {totalFollowers > 0 && <BaseS>{totalFollowers}</BaseS>}
        </HStack>
      </NavbarLink>
    </HStack>
  );
}

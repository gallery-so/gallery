import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseS } from '~/components/core/Text/Text';
import { GalleryNavLinksFragment$key } from '~/generated/GalleryNavLinksFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import { NavbarLink } from '../NavbarLink';

type Props = {
  username: string;
  queryRef: GalleryNavLinksFragment$key;
};

export function GalleryNavLinks({ username, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNavLinksFragment on GalleryUser {
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
      }
    `,
    queryRef
  );

  const totalFollowers = query.followers?.length ?? 0;
  const totalGalleries = useMemo(() => {
    return (
      removeNullValues(query.galleries?.map((gallery) => (gallery?.hidden ? null : gallery)))
        .length ?? 0
    );
  }, [query.galleries]);
  const totalPosts = query?.feed?.pageInfo?.total ?? 0;

  const { pathname } = useRouter();

  const featuredRoute: Route = { pathname: '/[username]', query: { username } };
  const galleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };
  const followersRoute: Route = { pathname: '/[username]/followers', query: { username } };
  const postsRoute: Route = { pathname: '/[username]/posts', query: { username } };

  return (
    <HStack gap={8}>
      <NavbarLink to={featuredRoute} active={pathname === featuredRoute.pathname}>
        <HStack gap={4} align="baseline">
          <span>Featured</span>
        </HStack>
      </NavbarLink>

      <NavbarLink to={galleriesRoute} active={pathname === galleriesRoute.pathname}>
        <HStack gap={4} align="baseline">
          <span>Galleries</span>
          {totalGalleries > 0 && <BaseS>{totalGalleries}</BaseS>}
        </HStack>
      </NavbarLink>

      <NavbarLink to={postsRoute} active={pathname === postsRoute.pathname}>
        <HStack gap={4} align="baseline">
          <span>Posts</span>
          {totalPosts > 0 && <BaseS>{totalPosts}</BaseS>}
        </HStack>
      </NavbarLink>

      <NavbarLink to={followersRoute} active={pathname === followersRoute.pathname}>
        <HStack gap={4} align="baseline">
          Followers
          {totalFollowers > 0 && <BaseS>{totalFollowers}</BaseS>}
        </HStack>
      </NavbarLink>
    </HStack>
  );
}

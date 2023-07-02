import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
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

  const { pathname } = useRouter();

  const featuredRoute: Route = { pathname: '/[username]', query: { username } };
  const galleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };
  const followersRoute: Route = { pathname: '/[username]/followers', query: { username } };
  const activityRoute: Route = { pathname: '/[username]/activity', query: { username } };

  return (
    <HStack gap={8}>
      <NavbarLink
        // @ts-expect-error We're not using the legacy Link
        href={route(featuredRoute)}
        active={pathname === featuredRoute.pathname}
      >
        <HStack gap={4} align="baseline">
          <span>Featured</span>
        </HStack>
      </NavbarLink>

      <NavbarLink
        // @ts-expect-error We're not using the legacy Link
        href={route(galleriesRoute)}
        active={pathname === galleriesRoute.pathname}
      >
        <HStack gap={4} align="baseline">
          <span>Galleries</span>
          {totalGalleries > 0 && <BaseS>{totalGalleries}</BaseS>}
        </HStack>
      </NavbarLink>

      <NavbarLink
        // @ts-expect-error We're not using the legacy Link
        href={route(followersRoute)}
        active={pathname === followersRoute.pathname}
      >
        <HStack gap={4} align="baseline">
          Followers
          {totalFollowers > 0 && <BaseS>{totalFollowers}</BaseS>}
        </HStack>
      </NavbarLink>

      <NavbarLink
        // @ts-expect-error We're not using the legacy Link
        href={route(activityRoute)}
        active={pathname === activityRoute.pathname}
      >
        Activity
      </NavbarLink>
    </HStack>
  );
}

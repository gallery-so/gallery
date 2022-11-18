import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { HStack } from '~/components/core/Spacer/Stack';
import { NavbarLink } from '~/contexts/globalLayout/GlobalNavbar/NavbarLink';
import { GalleryNavLinksFragment$key } from '~/generated/GalleryNavLinksFragment.graphql';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

type Props = {
  username: string;
  queryRef: GalleryNavLinksFragment$key;
};

export function GalleryNavLinks({ username, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNavLinksFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const { pathname } = useRouter();

  const galleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };
  const followersRoute: Route = { pathname: '/[username]/followers', query: { username } };
  const activityRoute: Route = { pathname: '/[username]/activity', query: { username } };

  const isWhiteRhinoEnabled = isFeatureEnabled(FeatureFlag.WHITE_RHINO, query);

  return (
    <HStack gap={8}>
      <Link href={galleriesRoute}>
        <NavbarLink href={route(galleriesRoute)} active={pathname === galleriesRoute.pathname}>
          Galleries
        </NavbarLink>
      </Link>

      <Link href={followersRoute}>
        <NavbarLink href={route(followersRoute)} active={pathname === followersRoute.pathname}>
          Followers
        </NavbarLink>
      </Link>

      {isWhiteRhinoEnabled && (
        <Link href={activityRoute}>
          <NavbarLink href={route(activityRoute)} active={pathname === activityRoute.pathname}>
            Activity
          </NavbarLink>
        </Link>
      )}
    </HStack>
  );
}

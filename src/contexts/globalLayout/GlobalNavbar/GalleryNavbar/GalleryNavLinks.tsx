import { HStack } from 'components/core/Spacer/Stack';
import { NavbarLink } from 'contexts/globalLayout/GlobalNavbar/NavbarLink';
import Link from 'next/link';
import { useRouter } from 'next/router';
import isFeatureEnabled, { FeatureFlag } from 'utils/graphql/isFeatureEnabled';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryNavLinksFragment$key } from '../../../../../__generated__/GalleryNavLinksFragment.graphql';
import { route, Route } from 'nextjs-routes';

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

  const isWhiteRinoEnabled = isFeatureEnabled(FeatureFlag.WHITE_RINO, query);

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

      {isWhiteRinoEnabled && (
        <Link href={activityRoute}>
          <NavbarLink href={route(activityRoute)} active={pathname === activityRoute.pathname}>
            Activity
          </NavbarLink>
        </Link>
      )}
    </HStack>
  );
}

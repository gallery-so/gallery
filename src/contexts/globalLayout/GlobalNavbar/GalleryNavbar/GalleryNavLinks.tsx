import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';

import { HStack } from '~/components/core/Spacer/Stack';

import { NavbarLink } from '../NavbarLink';

type Props = {
  username: string;
};

export function GalleryNavLinks({ username }: Props) {
  const { pathname } = useRouter();

  const galleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };
  const followersRoute: Route = { pathname: '/[username]/followers', query: { username } };
  const activityRoute: Route = { pathname: '/[username]/activity', query: { username } };

  return (
    <HStack gap={8}>
      <NavbarLink
        // @ts-expect-error We're not using the legacy Link
        href={route(galleriesRoute)}
        active={pathname === galleriesRoute.pathname}
      >
        Galleries
      </NavbarLink>

      <NavbarLink
        // @ts-expect-error We're not using the legacy Link
        href={route(followersRoute)}
        active={pathname === followersRoute.pathname}
      >
        Followers
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

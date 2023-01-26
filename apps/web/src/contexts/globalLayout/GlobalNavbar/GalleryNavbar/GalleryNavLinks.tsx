import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route, route } from 'nextjs-routes';

import { HStack } from '~/components/core/Spacer/Stack';
import { NavbarLink } from '~/contexts/globalLayout/GlobalNavbar/NavbarLink';

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

      <Link href={activityRoute}>
        <NavbarLink href={route(activityRoute)} active={pathname === activityRoute.pathname}>
          Activity
        </NavbarLink>
      </Link>
    </HStack>
  );
}

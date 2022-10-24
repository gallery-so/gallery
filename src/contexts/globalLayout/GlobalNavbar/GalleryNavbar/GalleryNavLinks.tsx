import { HStack } from 'components/core/Spacer/Stack';
import { NavbarLink } from 'contexts/globalLayout/GlobalNavbar/NavbarLink';
import Link from 'next/link';
import { useRouter } from 'next/router';

type Props = {
  username: string;
};

export function GalleryNavLinks({ username }: Props) {
  const { pathname } = useRouter();

  const galleriesUrl = `/${username}/galleries`;
  const followersUrl = `/${username}/followers`;
  const activityUrl = `/${username}/activity`;

  return (
    <HStack gap={8}>
      <Link href={galleriesUrl}>
        <NavbarLink href={galleriesUrl} active={pathname === '/[username]/galleries'}>
          Galleries
        </NavbarLink>
      </Link>

      <Link href={followersUrl}>
        <NavbarLink href={followersUrl} active={pathname === '/[username]/followers'}>
          Followers
        </NavbarLink>
      </Link>

      <Link href={activityUrl}>
        <NavbarLink href={activityUrl} active={pathname === '/[username]/activity'}>
          Activity
        </NavbarLink>
      </Link>
    </HStack>
  );
}

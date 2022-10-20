import { HStack } from 'components/core/Spacer/Stack';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NavbarLink } from 'contexts/globalLayout/GlobalNavbar/NavbarLink';

type Props = {
  username: string;
};

export default function GalleryCenterContent({ username }: Props) {
  const { pathname } = useRouter();

  const galleriesUrl = `/${username}/galleries`;
  const followersUrl = `/${username}/followers`;

  return (
    <HStack gap={8}>
      <Link href={galleriesUrl}>
        <NavbarLink href={galleriesUrl} active={pathname === '/galleries'}>
          Galleries
        </NavbarLink>
      </Link>

      <Link href={followersUrl}>
        <NavbarLink href={followersUrl} active={pathname === '/followers'}>
          Followers
        </NavbarLink>
      </Link>
    </HStack>
  );
}

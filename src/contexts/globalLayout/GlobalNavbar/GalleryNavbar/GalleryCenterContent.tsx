import styled from 'styled-components';
import { HStack } from 'components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from 'components/core/Text/Text';
import Link from 'next/link';
import colors from 'components/core/colors';
import { useRouter } from 'next/router';
import { NavbarLink } from 'contexts/globalLayout/GlobalNavbar/NavbarLink';

export default function GalleryCenterContent() {
  const { pathname } = useRouter();

  return (
    <HStack gap={8}>
      <Link href="/galleries">
        <NavbarLink href="/galleries" active={pathname === '/galleries'}>
          Galleries
        </NavbarLink>
      </Link>

      <Link href="/followers">
        <NavbarLink href="/followers" active={pathname === '/followers'}>
          Followers
        </NavbarLink>
      </Link>
    </HStack>
  );
}

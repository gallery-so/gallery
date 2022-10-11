import styled from 'styled-components';
import { HStack } from 'components/core/Spacer/Stack';
import { BODY_FONT_FAMILY } from 'components/core/Text/Text';
import Link from 'next/link';
import colors from 'components/core/colors';
import { useRouter } from 'next/router';

export default function GalleryCenterContent() {
  const { pathname } = useRouter();

  return (
    <HStack gap={8}>
      <Link href="/Users/terence/Code/gallery/pages/galleries">
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

const NavbarLink = styled.a<{ active: boolean }>`
  font-family: ${BODY_FONT_FAMILY};
  font-weight: 500;
  font-size: 18px;
  line-height: 21px;
  margin: 0;

  color: ${({ active }) => (active ? colors.offBlack : colors.metal)};

  text-decoration: none;
`;

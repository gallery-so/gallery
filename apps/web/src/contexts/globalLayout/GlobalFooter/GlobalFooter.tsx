import { route } from 'nextjs-routes';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import NavLink from '~/components/core/NavLink/NavLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import {
  GALLERY_BLOG,
  GALLERY_DISCORD,
  GALLERY_FAQ,
  GALLERY_JOBS,
  GALLERY_TWITTER,
} from '~/constants/urls';
import { LogoLarge } from '~/icons/LogoLarge';
import colors from '~/shared/theme/colors';

type Props = {
  theme?: 'light' | 'dark';
};

function GlobalFooter({ theme = 'light' }: Props) {
  return (
    <StyledGlobalFooter theme={theme}>
      <HStack>
        <HStack gap={4}>
          <GalleryLink to={{ pathname: '/' }}>
            <StyledLogo theme={theme} />
          </GalleryLink>
        </HStack>
      </HStack>
      <StyledLinkContainer>
        <HStack gap={72} wrap="wrap">
          <VStack gap={8}>
            <StyledFooterLink href={GALLERY_FAQ}>FAQ</StyledFooterLink>
            <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
          </VStack>
          <VStack gap={8}>
            <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
            <StyledFooterLink href={GALLERY_BLOG}>Blog</StyledFooterLink>
          </VStack>
          <VStack gap={8}>
            <StyledFooterLink href={GALLERY_JOBS}>Jobs</StyledFooterLink>
          </VStack>
        </HStack>
        <HStack gap={8}>
          <StyledFooterLink href={route({ pathname: '/privacy' })}>Privacy</StyledFooterLink>
          <StyledFooterLink href={route({ pathname: '/terms' })}>Terms</StyledFooterLink>
          <StyledPlainText color={colors.metal}>
            © Gallery Labs, {new Date().getFullYear()}{' '}
          </StyledPlainText>
        </HStack>
      </StyledLinkContainer>
    </StyledGlobalFooter>
  );
}

type StyledFooterProps = {
  isMobile?: boolean;
  theme: 'light' | 'dark';
};

export const GLOBAL_FOOTER_HEIGHT = 358;
export const GLOBAL_FOOTER_HEIGHT_MOBILE = 134;

const StyledFooterLink = styled(NavLink)<StyledFooterProps>`
  font-size: 16px;
  line-height: 20px;
  display: flex;
  text-transform: capitalize;
`;

const StyledGlobalFooter = styled.div<StyledFooterProps>`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 110px 0;

  padding: 32px;

  background-color: ${({ theme }) => (theme === 'light' ? colors.offWhite : colors.black['800'])};

  @media only screen and ${breakpoints.desktop} {
    padding: 80px;
  }

  ${StyledFooterLink} {
    color: ${({ theme }) => (theme === 'light' ? colors.black['800'] : colors.white)};

    &:hover {
      color: ${colors.shadow};
    }
  }
`;

const StyledLinkContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 48px;
  @media only screen and ${breakpoints.desktop} {
    justify-content: space-between;
    flex-direction: row;
    align-items: end;
  }
`;
const StyledLogo = styled(LogoLarge)<StyledFooterProps>`
  height: 36px;
  cursor: pointer;
  color: ${({ theme }) => (theme === 'light' ? colors.black['800'] : colors.white)};
`;

const StyledPlainText = styled(BaseM)`
  font-size: 16px;
`;

export default GlobalFooter;

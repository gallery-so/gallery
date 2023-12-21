import { route } from 'nextjs-routes';
import styled from 'styled-components';

import breakpoints, { pageGutter } from '~/components/core/breakpoints';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import NavLink from '~/components/core/NavLink/NavLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BaseS, TitleM } from '~/components/core/Text/Text';
import {
  GALLERY_BLOG,
  GALLERY_DISCORD,
  GALLERY_FAQ,
  GALLERY_JOBS,
  GALLERY_MEMBERSHIP_OPENSEA,
  GALLERY_TWITTER,
} from '~/constants/urls';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import LogoBracketLeft from '~/icons/LogoBracketLeft';
import LogoBracketRight from '~/icons/LogoBracketRight';
import { LogoLarge } from '~/icons/LogoLarge';
import colors from '~/shared/theme/colors';

function GlobalFooter() {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledGlobalFooter isMobile={isMobile}>
      {isMobile && <StyledHr />}
      <VStack gap={110}>
        <HStack gap={4}>
          <GalleryLink to={{ pathname: '/' }}>
            <StyledLogo />
          </GalleryLink>
        </HStack>
        <HStack gap={8} wrap="wrap">
          <StyledFooterLink href={GALLERY_FAQ}>FAQ</StyledFooterLink>
          <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
          <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
          <StyledFooterLink href={GALLERY_BLOG}>Blog</StyledFooterLink>
          <StyledFooterLink href={GALLERY_MEMBERSHIP_OPENSEA}>OpenSea</StyledFooterLink>
          <StyledFooterLink href={GALLERY_JOBS}>Jobs</StyledFooterLink>
          <StyledFooterLink href={route({ pathname: '/shop' })}>
            <HStack gap={4}>
              Shop
              <StyledObjectsContainer>
                <StyledLogoBracketLeft color={colors.shadow} />
                <HStack gap={1}>
                  <StyledShopText>OBJECTS</StyledShopText>
                  <StyledLogoBracketRight color={colors.shadow} />
                </HStack>
              </StyledObjectsContainer>
            </HStack>
          </StyledFooterLink>
        </HStack>
      </VStack>
      <StyledFooterLinkContainer isMobile={isMobile}>
        <HStack gap={8}>
          <StyledFooterLink href={route({ pathname: '/privacy' })}>Privacy</StyledFooterLink>
          <StyledFooterLink href={route({ pathname: '/terms' })}>Terms</StyledFooterLink>
          <StyledPlainText color={colors.metal}>
            © Gallery Labs, {new Date().getFullYear()}{' '}
          </StyledPlainText>
        </HStack>
      </StyledFooterLinkContainer>
    </StyledGlobalFooter>
  );
}

const StyledObjectsContainer = styled.div`
  height: 16px;
  display: flex;
  align-items: center;
`;

const StyledShopText = styled(TitleM)`
  font-family: 'GT Alpina Condensed';
  display: inline;
  height: 16px;
  font-style: normal;
  font-weight: 300;
  font-size: 14.4127px;
  line-height: 16px;
  color: inherit;
`;

const StyledLogoBracketLeft = styled(LogoBracketLeft)`
  width: 6px;
  height: 14px;
`;

const StyledLogoBracketRight = styled(LogoBracketRight)`
  width: 6px;
  height: 14px;
`;

type StyledFooterProps = {
  isMobile: boolean;
};

export const GLOBAL_FOOTER_HEIGHT = 80;
export const GLOBAL_FOOTER_HEIGHT_MOBILE = 134;

const StyledGlobalFooter = styled.div<StyledFooterProps>`
  display: flex;
  justify-content: space-between;
  align-items: ${({ isMobile }) => (isMobile ? 'inherit' : 'flex-end')};
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};

  // height: ${({ isMobile }) =>
    `${isMobile ? GLOBAL_FOOTER_HEIGHT_MOBILE : GLOBAL_FOOTER_HEIGHT}px`};
  padding: 0 ${pageGutter.mobile}px 24px;

  background-color: ${colors.black['800']};

  @media only screen and ${breakpoints.desktop} {
    padding: 80px 180px;
  }
`;

const StyledHr = styled.hr`
  border: 1px solid #f7f7f7;
  width: 100%;
  margin: 16px 0px;
`;

const StyledLogo = styled(LogoLarge)`
  height: 24px;
  cursor: pointer;
  color: ${colors.white};
`;

const StyledFooterLinkContainer = styled.div<{ isMobile: boolean }>`
  padding-top: ${({ isMobile }) => (isMobile ? '4px' : '0px')};
`;

const StyledFooterLink = styled(NavLink)`
  font-size: 16px;
  line-height: 20px;
  display: flex;
  text-transform: capitalize;
  color: ${colors.white};

  &:hover {
    color: ${colors.shadow};
  }
`;

const StyledPlainText = styled(BaseM)`
  font-size: 16px;
`;

export default GlobalFooter;

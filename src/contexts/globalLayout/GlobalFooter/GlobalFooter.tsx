import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { BaseS, TitleM } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import {
  GALLERY_FAQ,
  GALLERY_JOBS,
  GALLERY_DISCORD,
  GALLERY_MEMBERSHIP_OPENSEA,
  GALLERY_TWITTER,
  GALLERY_BLOG,
} from 'constants/urls';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import Link from 'next/link';
import NavLink from 'components/core/NavLink/NavLink';
import LogoBracketLeft from 'icons/LogoBracketLeft';
import LogoBracketRight from 'icons/LogoBracketRight';
import { HStack, VStack } from 'components/core/Spacer/Stack';

function GlobalFooter() {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledGlobalFooter isMobile={isMobile}>
      {isMobile && <StyledHr />}
      <VStack gap={4}>
        <HStack gap={4}>
          <Link href="/">
            <StyledLogo src="/icons/logo-large.svg" />
          </Link>
          <BaseS>BETA</BaseS>
        </HStack>
        <HStack gap={8}>
          <StyledFooterLink href={GALLERY_FAQ}>FAQ</StyledFooterLink>
          <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
          <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
          <StyledFooterLink href={GALLERY_BLOG}>Blog</StyledFooterLink>
          <StyledFooterLink href={GALLERY_MEMBERSHIP_OPENSEA}>OpenSea</StyledFooterLink>
          <StyledFooterLink href={GALLERY_JOBS}>Jobs</StyledFooterLink>
          <StyledFooterLink href="/shop">
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
          <BaseS color={colors.offBlack}>© {new Date().getFullYear()} All rights reserved</BaseS>
          <BaseS color={colors.metal}>·</BaseS>
          <StyledFooterLink href="/privacy">Privacy</StyledFooterLink>
          <StyledFooterLink href="/terms">Terms</StyledFooterLink>
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

  height: ${({ isMobile }) => `${isMobile ? GLOBAL_FOOTER_HEIGHT_MOBILE : GLOBAL_FOOTER_HEIGHT}px`};
  padding: 0 ${pageGutter.mobile}px 24px;

  background-color: ${colors.white};

  @media only screen and ${breakpoints.desktop} {
    padding: 0 32px 24px;
  }
`;

const StyledHr = styled.hr`
  border: 1px solid #f7f7f7;
  width: 100%;
  margin: 16px 0px;
`;

const StyledLogo = styled.img`
  height: 24px;
  cursor: pointer;
`;

const StyledFooterLinkContainer = styled.div<{ isMobile: boolean }>`
  padding-top: ${({ isMobile }) => (isMobile ? '4px' : '0px')};
`;

const StyledFooterLink = styled(NavLink)`
  display: flex;
  text-transform: capitalize;
`;

export default GlobalFooter;

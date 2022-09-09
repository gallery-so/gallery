import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { BaseS, TitleM } from 'components/core/Text/Text';
import DeprecatedSpacer from 'components/core/Spacer/DeprecatedSpacer';
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

function GlobalFooter() {
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledGlobalFooter isMobile={isMobile}>
      {isMobile && <StyledHr />}
      <MainContent>
        <LogoWrapper>
          <Link href="/">
            <StyledLogo src="/icons/logo-large.svg" />
          </Link>
          <DeprecatedSpacer width={4} />
          <BaseS>BETA</BaseS>
        </LogoWrapper>
        <DeprecatedSpacer height={4} />
        <StyledLinkContainer>
          <StyledFooterLink href={GALLERY_FAQ}>FAQ</StyledFooterLink>
          <DeprecatedSpacer width={8} />
          <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
          <DeprecatedSpacer width={8} />
          <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
          <DeprecatedSpacer width={8} />
          <StyledFooterLink href={GALLERY_BLOG}>Blog</StyledFooterLink>
          <DeprecatedSpacer width={8} />
          <StyledFooterLink href={GALLERY_MEMBERSHIP_OPENSEA}>OpenSea</StyledFooterLink>
          <DeprecatedSpacer width={8} />
          <StyledFooterLink href={GALLERY_JOBS}>Jobs</StyledFooterLink>
          <DeprecatedSpacer width={8} />
          <StyledFooterLink href="/shop">
            Shop
            <DeprecatedSpacer width={4} />
            <StyledObjectsContainer>
              <StyledLogoBracketLeft color={colors.shadow} />
              <StyledShopText>OBJECTS</StyledShopText>
              <DeprecatedSpacer width={1} />
              <StyledLogoBracketRight color={colors.shadow} />
            </StyledObjectsContainer>
          </StyledFooterLink>
        </StyledLinkContainer>
      </MainContent>
      {isMobile && <DeprecatedSpacer height={4} />}
      <BoringLegalContent>
        <BaseS color={colors.offBlack}>© {new Date().getFullYear()} All rights reserved</BaseS>
        <DeprecatedSpacer width={8} />
        <BaseS color={colors.metal}>·</BaseS>
        <DeprecatedSpacer width={8} />
        <StyledFooterLink href="/privacy">Privacy</StyledFooterLink>
        <DeprecatedSpacer width={8} />
        <StyledFooterLink href="/terms">Terms</StyledFooterLink>
      </BoringLegalContent>
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

const MainContent = styled.div``;

const LogoWrapper = styled.div`
  display: flex;
`;

const StyledHr = styled.hr`
  border: 1px solid #f7f7f7;
  width: 100%;
  margin: 16px 0px;
`;

const BoringLegalContent = styled.div`
  display: flex;
`;

const StyledLogo = styled.img`
  height: 24px;
  cursor: pointer;
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

const StyledFooterLink = styled(NavLink)`
  display: flex;
  text-transform: capitalize;
`;

export default GlobalFooter;

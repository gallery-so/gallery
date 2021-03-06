import styled, { css } from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { BaseS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import {
  GALLERY_FAQ,
  GALLERY_JOBS,
  GALLERY_DISCORD,
  GALLERY_MEMBERSHIP_OPENSEA,
  GALLERY_TWITTER,
  GALLERY_BLOG,
} from 'constants/urls';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import Link from 'next/link';
import NavLink from 'components/core/NavLink/NavLink';

type GlobalFooterProps = { isFixed?: boolean };

function GlobalFooter({ isFixed = false }: GlobalFooterProps) {
  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledGlobalFooter isFixed={isFixed} isMobile={isMobile}>
      {isMobile && <StyledHr />}
      <MainContent>
        <LogoWrapper>
          <Link href="/">
            <StyledLogo src="/icons/logo-large.svg" />
          </Link>
          <Spacer width={4} />
          <BaseS>BETA</BaseS>
        </LogoWrapper>
        <Spacer height={4} />
        <StyledLinkContainer>
          <StyledFooterLink href={GALLERY_FAQ}>FAQ</StyledFooterLink>
          <Spacer width={8} />
          <StyledFooterLink href={GALLERY_TWITTER}>Twitter</StyledFooterLink>
          <Spacer width={8} />
          <StyledFooterLink href={GALLERY_DISCORD}>Discord</StyledFooterLink>
          <Spacer width={8} />
          <StyledFooterLink href={GALLERY_BLOG}>Blog</StyledFooterLink>
          <Spacer width={8} />
          <StyledFooterLink href={GALLERY_MEMBERSHIP_OPENSEA}>OpenSea</StyledFooterLink>
          <Spacer width={8} />
          <StyledFooterLink href={GALLERY_JOBS}>Jobs</StyledFooterLink>
          <Spacer width={8} />
        </StyledLinkContainer>
      </MainContent>
      {isMobile && <Spacer height={4} />}
      <BoringLegalContent>
        <BaseS color={colors.offBlack}>© {new Date().getFullYear()} All rights reserved</BaseS>
        <Spacer width={8} />
        <BaseS color={colors.metal}>·</BaseS>
        <Spacer width={8} />
        <StyledFooterLink href="/privacy">Privacy</StyledFooterLink>
        <Spacer width={8} />
        <StyledFooterLink href="/terms">Terms</StyledFooterLink>
      </BoringLegalContent>
    </StyledGlobalFooter>
  );
}

type StyledFooterProps = {
  isFixed: boolean;
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

  // TODO: all of this can go away with new layout + NFT Detail Modal update
  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px 24px;

    ${({ isFixed }) =>
      isFixed &&
      css`
        position: fixed;
        bottom: 0;
        width: 100%;

        background: ${colors.white};
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 1) 50%
        );
      `}
  }

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
  text-transform: capitalize;
`;

export default GlobalFooter;

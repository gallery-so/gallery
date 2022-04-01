import styled, { css } from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { BaseM, BaseS } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_FOOTER_HEIGHT_MOBILE } from './constants';
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
import NavLink from '../NavLink/NavLink';

type GlobalFooterProps = { isFixed?: boolean };

function GlobalFooter({ isFixed = false }: GlobalFooterProps) {
  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledGlobalFooter isFixed={isFixed} isMobile={isMobile}>
      {isMobile && <StyledHr />}
      <MainContent>
        <Link href="/">
          <StyledLogo src="/icons/logo-large.svg" />
        </Link>
        <Spacer height={4} />
        <StyledLinkContainer>
          <NavLink href={GALLERY_FAQ}>FAQ</NavLink>
          <Spacer width={8} />
          <NavLink href={GALLERY_TWITTER}>Twitter</NavLink>
          <Spacer width={8} />
          <NavLink href={GALLERY_DISCORD}>Discord</NavLink>
          <Spacer width={8} />
          <NavLink href={GALLERY_BLOG}>Blog</NavLink>
          <Spacer width={8} />
          <NavLink href={GALLERY_MEMBERSHIP_OPENSEA}>OpenSea</NavLink>
          <Spacer width={8} />
          <NavLink href={GALLERY_JOBS}>Jobs</NavLink>
          <Spacer width={8} />
        </StyledLinkContainer>
      </MainContent>
      {isMobile && <Spacer height={4} />}
      <BoringLegalContent>
        <BaseS color={colors.offBlack}>© {new Date().getFullYear()} All rights reserved</BaseS>
        <Spacer width={8} />
        <BaseS color={colors.metal}>·</BaseS>
        <Spacer width={8} />
        <NavLink href="/privacy">Privacy</NavLink>
        <Spacer width={8} />
        <NavLink href="/terms">Terms</NavLink>
      </BoringLegalContent>
    </StyledGlobalFooter>
  );
}

type StyledFooterProps = {
  isFixed: boolean;
  isMobile: boolean;
};

const StyledGlobalFooter = styled.div<StyledFooterProps>`
  display: flex;
  justify-content: space-between;
  align-items: ${({ isMobile }) => (isMobile ? 'inherit' : 'flex-end')};
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};

  height: ${({ isMobile }) => `${isMobile ? GLOBAL_FOOTER_HEIGHT_MOBILE : GLOBAL_FOOTER_HEIGHT}px`};
  padding: 0 ${pageGutter.mobile}px 24px;

  background-color: ${colors.white};
  z-index: 2;
  position: relative;
}

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px 24px;

    ${({ isFixed }) =>
      isFixed &&
      css`
        z-index: 2;
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

const StyledHr = styled.hr`
  border: 1px solid #f7f7f7;
  width: 100%;
  margin: 16px 0px;
`;

const BoringLegalContent = styled.div`
  display: flex;
`;

const StyledLogo = styled.img`
  height: 16px;
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

const StyledLink = styled.a`
  text-decoration: none;
`;

const StyledLinkText = styled(BaseM)`
  transition: color ${transitions.cubic};
  &:hover {
    color: ${colors.offBlack};
  }
`;

export default GlobalFooter;

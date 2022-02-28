import styled, { css } from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { Caption, TitleSerif } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_FOOTER_HEIGHT_MOBILE } from './constants';
import {
  GALLERY_JOBS,
  GALLERY_DISCORD,
  GALLERY_MEMBERSHIP_OPENSEA,
  GALLERY_TWITTER,
  GALLERY_BLOG,
} from 'constants/urls';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import Link from 'next/link';

type GlobalFooterProps = { isFixed?: boolean };

function GlobalFooter({ isFixed = false }: GlobalFooterProps) {
  const isMobile = useIsMobileWindowWidth();

  return (
    <StyledGlobalFooter isFixed={isFixed} isMobile={isMobile}>
      <MainContent>
        <Link href="/">
          <StyledLogo>GALLERY</StyledLogo>
        </Link>
        <Spacer height={isMobile ? 8 : 4} />
        <StyledLinkContainer>
          <StyledLink href={GALLERY_TWITTER} target="_blank" rel="noreferrer">
            <StyledLinkText color={colors.gray40}>Twitter</StyledLinkText>
          </StyledLink>
          <Spacer width={8} />
          <StyledLink href={GALLERY_DISCORD} target="_blank" rel="noreferrer">
            <StyledLinkText color={colors.gray40}>Discord</StyledLinkText>
          </StyledLink>
          <Spacer width={8} />
          <StyledLink href={GALLERY_BLOG} target="_blank" rel="noreferrer">
            <StyledLinkText color={colors.gray40}>Blog</StyledLinkText>
          </StyledLink>
          <Spacer width={8} />
          <StyledLink href={GALLERY_MEMBERSHIP_OPENSEA} target="_blank" rel="noreferrer">
            <StyledLinkText color={colors.gray40}>OpenSea</StyledLinkText>
          </StyledLink>
          <Spacer width={8} />
          <StyledLink href={GALLERY_JOBS} target="_blank" rel="noreferrer">
            <StyledLinkText color={colors.gray40}>Jobs</StyledLinkText>
          </StyledLink>
          <Spacer width={8} />
        </StyledLinkContainer>
      </MainContent>
      {isMobile && <StyledHr />}
      <BoringLegalContent isMobile={isMobile}>
        <Caption color={colors.black}>{new Date().getFullYear()} - All rights reserved</Caption>
        <Spacer height={4} />
        <StyledLinkContainer>
          <StyledLink href="/privacy">
            <StyledLinkText color={colors.gray40}>Privacy</StyledLinkText>
          </StyledLink>
          <Spacer width={8} />
          <StyledLink href="/terms">
            <StyledLinkText color={colors.gray40}>Terms</StyledLinkText>
          </StyledLink>
        </StyledLinkContainer>
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
  align-items: ${({ isMobile }) => (isMobile ? 'center' : 'flex-end')};
  flex-direction: ${({ isMobile }) => (isMobile ? 'column' : 'row')};
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'inherit')};

  height: ${({ isMobile }) => `${isMobile ? GLOBAL_FOOTER_HEIGHT_MOBILE : GLOBAL_FOOTER_HEIGHT}px`};
  padding: 0 ${pageGutter.mobile}px 16px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px 16px;

    ${({ isFixed }) =>
      isFixed &&
      css`
        z-index: 1;
        position: fixed;
        bottom: 0;
        width: 100%;

        background: white;
        background: linear-gradient(
          to bottom,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 1) 50%
        );
      `}
  }

  @media only screen and ${breakpoints.desktop} {
    padding: 0 32px 16px;
  }
`;

const MainContent = styled.div``;

const StyledHr = styled.hr`
  border: 1px solid #f7f7f7;
  width: 100%;
  margin: 16px;
`;

const BoringLegalContent = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isMobile }) => (isMobile ? 'center' : 'flex-end')};
`;

const StyledLogo = styled(TitleSerif)`
  font-size: 24px;
  cursor: pointer;
`;

const StyledLinkContainer = styled.div`
  display: flex;
`;

const StyledLink = styled.a`
  text-decoration: none;
`;

const StyledLinkText = styled(Caption)`
  transition: color ${transitions.cubic};
  &:hover {
    color: ${colors.gray50};
  }
`;

export default GlobalFooter;

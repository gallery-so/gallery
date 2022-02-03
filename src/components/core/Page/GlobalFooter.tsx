import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { Caption, TitleSerif } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';
import { GLOBAL_FOOTER_HEIGHT } from './constants';
import {
  GALLERY_JOBS,
  GALLERY_DISCORD,
  GALLERY_MEMBERSHIP_OPENSEA,
  GALLERY_TWITTER,
  GALLERY_BLOG,
} from 'constants/urls';

function GlobalFooter() {
  return (
    <StyledGlobalFooter>
      <StyledLogo>GALLERY</StyledLogo>
      <Spacer height={4} />
      <StyledBottomText>
        <Caption color={colors.gray40}>{new Date().getFullYear()} - All rights reserved</Caption>
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
        </StyledLinkContainer>
      </StyledBottomText>
    </StyledGlobalFooter>
  );
}

const StyledGlobalFooter = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;

  height: ${GLOBAL_FOOTER_HEIGHT}px;

  padding: 0 ${pageGutter.mobile}px 16px;

  @media only screen and ${breakpoints.tablet} {
    padding: 0 ${pageGutter.tablet}px 16px;
    position: fixed;
    bottom: 0;
    width: 100%;

    background: white;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 50%);
  }

  @media only screen and ${breakpoints.desktop} {
    padding: 0 32px 16px;
  }
`;

const StyledLogo = styled(TitleSerif)`
  font-size: 24px;
`;

const StyledBottomText = styled.div`
  display: flex;
  justify-content: space-between;
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

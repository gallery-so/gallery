import styled from 'styled-components';
import breakpoints, { pageGutter } from 'components/core/breakpoints';
import { Caption, TitleSerif } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import transitions from 'components/core/transitions';

function GlobalFooter() {
  return (
    <StyledGlobalFooter>
      <StyledLogo>GALLERY</StyledLogo>
      <Spacer height={4}></Spacer>
      <StyledBottomText>
        <Caption color={colors.gray40}>2021 - All rights reserved</Caption>
        <StyledLinkContainer>
          <StyledLink
            href="TODO__v1 add discord link"
            target="_blank"
            rel="noreferrer"
          >
            <StyledLinkText color={colors.gray40}>Discord</StyledLinkText>
          </StyledLink>
          <Spacer width={8}></Spacer>
          <StyledLink
            href="https://twitter.com/usegallery"
            target="_blank"
            rel="noreferrer"
          >
            <StyledLinkText color={colors.gray40}>Twitter</StyledLinkText>
          </StyledLink>
        </StyledLinkContainer>
      </StyledBottomText>
    </StyledGlobalFooter>
  );
}

const StyledGlobalFooter = styled.div`
  display: flex;
  flex-direction: column;

  margin: 32px ${pageGutter.mobile} 16px;

  @media only screen and ${breakpoints.tablet} {
    margin: 32px ${pageGutter.tablet} 16px;
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

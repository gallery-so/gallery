import styled from 'styled-components';
import { BaseM, TitleM, TitleXS } from 'components/core/Text/Text';
import breakpoints, { contentSize, pageGutter } from 'components/core/breakpoints';
import colors from 'components/core/colors';
import ActionText from 'components/core/ActionText/ActionText';
import StyledBackLink from 'components/NavbarBackLink/NavbarBackLink';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import Spacer from 'components/core/Spacer/Spacer';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';

export default function PosterPage() {
  const isMobile = useIsMobileWindowWidth();

  const POSTER_IMAGE_URL =
    'https://lh3.googleusercontent.com/Q9zjkyRRAugfSBDfqiuyoefUEglPb6Zt5kj9cn-NzavEEBx_JmCaeSdbasI6V9VlkyWtJtVm1lH3VhHBNhj5ZwzEZ6zvfxF0wnFjoQ=h1200';
  const BRAND_POST_URL = 'https://gallery.mirror.xyz/1jgwdWHqYF1dUQ0YoYf-hEpd-OgJ79dZ5L00ArBQzac';
  const POSTER_SECONDARY_URL =
    'https://opensea.io/assets/ethereum/0x7e619a01e1a3b3a6526d0e01fbac4822d48f439b/0';

  const handleBackClick = () => {
    window.history.back();
  };

  return (
    <StyledPage>
      <StyledPositionedBackLink>
        <ActionText onClick={handleBackClick}>← Back to gallery</ActionText>
      </StyledPositionedBackLink>
      <StyledWrapper>
        <StyledImageContainer>
          <StyledPosterImage src={POSTER_IMAGE_URL} />
        </StyledImageContainer>
        <StyledContent>
          <TitleM>2022 Community Poster</TitleM>
          <StyledParagraph>
            <BaseM>
              Thank you for being a member of Gallery. Members celebrated our{' '}
              <InteractiveLink href={BRAND_POST_URL}>new brand</InteractiveLink> by signing our
              poster.
            </BaseM>
            <Spacer height={8} />
            <BaseM>
              We made the final poster available to mint as a commemorative token for early
              believers in our mission and product.
            </BaseM>
            <Spacer height={8} />

            <BaseM>Minting is now closed. Thank you to everyone who minted one.</BaseM>
          </StyledParagraph>

          {!isMobile && <HorizontalBreak />}

          <StyledCallToAction>
            <StyledSecondaryLink href={POSTER_SECONDARY_URL} target="_blank">
              <TitleXS color={colors.white}>View on Secondary</TitleXS>
            </StyledSecondaryLink>
          </StyledCallToAction>
        </StyledContent>
      </StyledWrapper>
    </StyledPage>
  );
}

const StyledPage = styled.div`
  min-height: 100vh;
  padding: 64px 16px 0px;
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${contentSize.desktop}px;

  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;

  @media only screen and ${breakpoints.desktop} {
    padding: 64px 40px 20px;
  }
`;

const StyledImageContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const StyledPosterImage = styled.img`
  border: 1px solid ${colors.porcelain};
  margin: 0 auto;
  max-width: 100%;
  max-height: 600px;

  @media only screen and ${breakpoints.tablet} {
    justify-content: flex-start;

    width: initial;
  }
`;

const StyledPositionedBackLink = styled(StyledBackLink)`
  top: -0;
`;

const StyledWrapper = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  padding-bottom: 100px;

  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
  gap: 24px;

  @media only screen and ${breakpoints.tablet} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding-bottom: 0;
  }
`;
const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 ${pageGutter.mobile}px;
  max-width: 360px;
  margin: 0 auto;
  @media (max-width: ${contentSize.desktop}px) {
    margin: 0;
    padding: 0;
  }
`;

const StyledParagraph = styled.div`
  display: grid;
  gap: 8px;
`;

const StyledCallToAction = styled.div<{ hasEnded?: boolean }>`
  text-align: center;
  display: grid;
  gap: 12px;

  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: ${({ hasEnded }) => (hasEnded ? '1fr' : 'repeat(2, minmax(0, 1fr))')};
    align-items: center;
    text-align: ${({ hasEnded }) => (hasEnded ? 'center' : 'left')};
    position: fixed;
    z-index: 30;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: ${colors.white};
    padding: 12px 16px;
    border-top: 1px solid ${colors.porcelain};
  }
`;
const StyledSecondaryLink = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${colors.offBlack};
  cursor: pointer;
  height: 40px;
  text-decoration: none;
  &:hover {
    opacity: 0.8;
  }
`;

import styled from 'styled-components';
import { BaseM, BaseXL, TitleM } from 'components/core/Text/Text';
import { contentSize, pageGutter } from 'components/core/breakpoints';
import colors from 'components/core/colors';
import PosterFigmaFrame from './PosterFigmaFrame';
import ActionText from 'components/core/ActionText/ActionText';
import StyledBackLink from 'components/NavbarBackLink/NavbarBackLink';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import useTimer from 'hooks/useTimer';
import HorizontalBreak from 'components/core/HorizontalBreak/HorizontalBreak';
import { MINT_DATE } from 'constants/poster';
import PosterMintButton from './PosterMintButton';

export default function PosterPage() {
  const isMobile = useIsMobileWindowWidth();

  const FIGMA_URL = 'https://www.figma.com/file/Opg7LD36QqoVb2JyOa4Kwi/Poster-Page?node-id=0%3A1';
  // const BRAND_POST_URL = 'https://gallery.mirror.xyz/1jgwdWHqYF1dUQ0YoYf-hEpd-OgJ79dZ5L00ArBQzac';

  const { timestamp, hasEnded } = useTimer(MINT_DATE);

  const handleBackClick = () => {
    // TODO: Replace with hook
    window.history.back();
  };

  return (
    <StyledPage>
      <StyledPositionedBackLink>
        <ActionText onClick={handleBackClick}>← Back to gallery</ActionText>
      </StyledPositionedBackLink>
      <StyledWrapper>
        <PosterFigmaFrame url={FIGMA_URL}></PosterFigmaFrame>
        <StyledContent>
          <TitleM>2022 Community Poster</TitleM>
          <StyledParagraph>
            <BaseM>
              Thank you for being a member of Gallery. Members celebrated our new brand by signing a
              poster.
            </BaseM>
          </StyledParagraph>

          {!isMobile && <HorizontalBreak />}

          {hasEnded ? (
            <StyledCallToAction hasEnded>
              <BaseXL>Event has ended.</BaseXL>
            </StyledCallToAction>
          ) : (
            <StyledCallToAction>
              <BaseXL>{timestamp}</BaseXL>
              <PosterMintButton></PosterMintButton>
            </StyledCallToAction>
          )}
        </StyledContent>
      </StyledWrapper>
    </StyledPage>
  );
}

const StyledPage = styled.div`
  min-height: 100vh;
  padding: 20px 40px;
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${contentSize.desktop}px;

  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    padding: 0px 16px;
  }
`;

const StyledPositionedBackLink = styled(StyledBackLink)`
  top: -0;
`;

const StyledWrapper = styled.div`
  display: grid;
  align-items: center;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    gap: 24px;
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

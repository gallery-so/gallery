import styled from 'styled-components';
import Page from 'components/core/Page/Page';
import { BaseM, BaseXL, TitleM } from 'components/core/Text/Text';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Button from 'components/core/Button/Button';
import { contentSize, pageGutter } from 'components/core/breakpoints';
import colors from 'components/core/colors';
import PosterFigmaFrame from './PosterFigmaFrame';
import ActionText from 'components/core/ActionText/ActionText';
import StyledBackLink from 'components/NavbarBackLink/NavbarBackLink';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useToastActions } from 'contexts/toast/ToastContext';
import useTimer from 'hooks/useTimer';
import Spacer from 'components/core/Spacer/Spacer';

export default function PosterPage() {
  const isMobile = useIsMobileWindowWidth();
  const { pushToast } = useToastActions();

  const FIGMA_URL = 'https://www.figma.com/file/Opg7LD36QqoVb2JyOa4Kwi/Poster-Page?node-id=0%3A1';

  const { timestamp, hasEnded } = useTimer();

  const handleBackClick = () => {
    // TODO: Replace with hook
    window.history.back();
  };

  const handleSignPoster = () => {
    pushToast(
      'Thank you for participating in the (Object 006) 2022 Community Poster event.',
      () => {},
      true
    );
  };

  return (
    <StyledPage>
      <Spacer height={80} />
      <StyledPositionedBackLink>
        <ActionText onClick={handleBackClick}>← Back to gallery</ActionText>
      </StyledPositionedBackLink>
      <StyledWrapper>
        <PosterFigmaFrame url={FIGMA_URL}></PosterFigmaFrame>
        <StyledContent>
          <div>
            {isMobile && <TitleM>(Object006)</TitleM>}
            <TitleM>2022 Community Poster</TitleM>
            <InteractiveLink href="/">Gallery</InteractiveLink>
          </div>
          <StyledParagraph>
            <BaseM>
              Thank you for being a member of Gallery. Celebrate our new brand with us by signing
              our poster.
            </BaseM>
            <BaseM>
              The final product will be available to mint as a commemorative token for early
              believers in our mission and product.
            </BaseM>
          </StyledParagraph>

          {!isMobile && <StyledHr></StyledHr>}

          {hasEnded ? (
            <StyledCallToAction hasEnded>
              <BaseXL>Event has ended.</BaseXL>
            </StyledCallToAction>
          ) : (
            <StyledCallToAction>
              <BaseXL>{timestamp}</BaseXL>
              <StyledAnchor href={FIGMA_URL} target="_blank">
                <StyledButton onClick={handleSignPoster} text="Sign Poster"></StyledButton>
              </StyledAnchor>
            </StyledCallToAction>
          )}
        </StyledContent>
      </StyledWrapper>
    </StyledPage>
  );
}

const StyledPage = styled(Page)`
  padding: 20px 40px;
  display: flex;
  flex-direction: column;

  align-items: center;
  width: 100%;
  margin: 0 auto;
  max-width: ${contentSize.desktop}px;

  @media (max-width: ${contentSize.desktop}px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    padding: 80px 16px;
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

const StyledHr = styled.hr`
  height: 1px;
  border: none;
  background-color: ${colors.porcelain};
  width: 100%;
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

const StyledAnchor = styled.a`
  text-decoration: none;
`;

const StyledButton = styled(Button)`
  align-self: flex-end;
  width: 100%;
  height: 100%;
  padding: 12px 24px;
  text-decoration: none;
`;

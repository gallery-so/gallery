import Button from 'components/core/Button/Button';
import TextButton from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { TitleM } from 'components/core/Text/Text';
import styled from 'styled-components';

// NOTE: to toggle whether the modal should appear for authenticated users only,
// refer to `useGlobalAnnouncementPopover.tsx`
export default function GlobalAnnouncementPopover() {
  return (
    <StyledGlobalAnnouncementPopover>
      <Spacer height={92} />
      <HeaderContainer>
        <IntroText>
          A new way to <i>connect</i> with collectors
        </IntroText>
        <Spacer height={32} />
        <DescriptionText>
          Collectors are looking for ways to connect with each other. To help them stay up to date
          with their favorite collectors on Gallery, we’re introducing our biggest change thus far—
        </DescriptionText>
        <DescriptionTextItalic>a social feed.</DescriptionTextItalic>
        <Spacer height={32} />
        <ButtonContainer>
          <Button text="Start Browsing" />
          <Spacer width={32} />
          <TextButton text="Galleries To Follow ↓" />
        </ButtonContainer>
      </HeaderContainer>
      <Spacer height={64} />
      {/* TODO: replace this with recorded video */}
      <img src="./temp-asset.jpg" />
      <Spacer height={64} />
      <SecondaryHeaderContainer>
        <StyledSecondaryTitleL>Featured galleries to follow</StyledSecondaryTitleL>
        <Spacer height={12} />
        <DescriptionText>
          To get you started, you can follow some of our past{' '}
          <DescriptionTextItalic>Gallery of the Week</DescriptionTextItalic> winners, as voted by
          our community.
        </DescriptionText>
      </SecondaryHeaderContainer>
      <Spacer height={64} />
      <GalleryOfTheWeekContainer>
        <StyledPlaceholder />
        <StyledPlaceholder />
        <StyledPlaceholder />
        <StyledPlaceholder />
      </GalleryOfTheWeekContainer>
      <Spacer height={80} />
    </StyledGlobalAnnouncementPopover>
  );
}

const StyledGlobalAnnouncementPopover = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${colors.offWhite};
`;

const HeaderContainer = styled.div`
  width: 580px;
  text-align: center;
`;

const IntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-weight: 300;
  font-size: 84px;
  line-height: 69px;
  letter-spacing: -0.05em;
`;

const DescriptionText = styled(TitleM)`
  font-style: normal;
`;

const DescriptionTextItalic = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 24px;
  font-weight: 800;
  font-style: italic;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const SecondaryHeaderContainer = styled.div`
  width: 526px;
  text-align: center;
`;

const StyledSecondaryTitleL = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 42px;
  font-weight: 300;
  line-height: 48px;
  letter-spacing: -0.05em;
`;

const GalleryOfTheWeekContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: 24px;
  max-width: 1040px;
`;

const StyledPlaceholder = styled.div`
  width: 506px;
  height: 506px;
  background: ${colors.porcelain};
`;

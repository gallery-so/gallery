import Button from 'components/core/Button/Button';
import TextButton from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import Spacer from 'components/core/Spacer/Spacer';
import { TitleM } from 'components/core/Text/Text';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { GlobalAnnouncementPopover$key } from '__generated__/GlobalAnnouncementPopover.graphql';
import GalleryOfTheWeekCard from './Feed/GalleryOfTheWeekCard';

type Props = {
  queryRef: GlobalAnnouncementPopover$key;
};

// NOTE: in order to toggle whether the modal should appear for authenticated users only,
// refer to `useGlobalAnnouncementPopover.tsx`
export default function GlobalAnnouncementPopover({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GlobalAnnouncementPopover on Query {
        ...GalleryOfTheWeekCardQueryFragment

        galleryOfTheWeekWinners @required(action: LOG) {
          dbid
          ...GalleryOfTheWeekCardUserFragment
        }
      }
    `,
    queryRef
  );

  if (query === null) {
    throw new Error('GlobalAnnouncementPopver did not receive gallery of the week winners');
  }

  const { galleryOfTheWeekWinners: rawData } = query;
  const galleryOfTheWeekWinners = removeNullValues(rawData);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  return (
    <StyledGlobalAnnouncementPopover>
      {
        // A note on the architecture:
        // Although desktop and mobile views are similar, they're sufficiently different such that they warrant
        // different sets of components entirely. The alternative would be to litter this file with ternaries
        // and CSS params
        isMobile ? (
          <>
            <Spacer height={92} />
            <DesktopHeaderContainer>
              <DesktopIntroText>
                A new way to <i>connect</i> with collectors
              </DesktopIntroText>
              <Spacer height={32} />
              <DesktopDescriptionText>
                Collectors are looking for ways to connect with each other. To help them stay up to
                date with their favorite collectors on Gallery, we’re introducing our biggest change
                thus far—
              </DesktopDescriptionText>
              <DesktopDescriptionTextItalic>a social feed.</DesktopDescriptionTextItalic>
              <Spacer height={32} />
              <ButtonContainer>
                <Button text="Start Browsing" />
                <Spacer width={32} />
                <TextButton text="Galleries To Follow ↓" />
              </ButtonContainer>
            </DesktopHeaderContainer>
            <Spacer height={64} />
            {/* TODO: replace this with recorded video */}
            <img src="./temp-asset.jpg" />
            <Spacer height={64} />
            <DesktopSecondaryHeaderContainer>
              <DesktopStyledSecondaryTitleL>
                Featured galleries to follow
              </DesktopStyledSecondaryTitleL>
              <Spacer height={12} />
              <DesktopDescriptionText>
                To get you started, you can follow some of our past{' '}
                <DesktopDescriptionTextItalic>Gallery of the Week</DesktopDescriptionTextItalic>{' '}
                winners, as voted by our community.
              </DesktopDescriptionText>
            </DesktopSecondaryHeaderContainer>
            <Spacer height={64} />
            <DesktopGalleryOfTheWeekContainer>
              <DesktopGotwContainer />
              <DesktopGotwContainer />
              <DesktopGotwContainer />
              <DesktopGotwContainer />
            </DesktopGalleryOfTheWeekContainer>
            <Spacer height={80} />
          </>
        ) : (
          <>
            <Spacer height={92} />
            <DesktopHeaderContainer>
              <DesktopIntroText>
                A new way to <i>connect</i> with collectors
              </DesktopIntroText>
              <Spacer height={32} />
              <DesktopDescriptionText>
                Collectors are looking for ways to connect with each other. To help them stay up to
                date with their favorite collectors on Gallery, we’re introducing our biggest change
                thus far—
              </DesktopDescriptionText>
              <DesktopDescriptionTextItalic>a social feed.</DesktopDescriptionTextItalic>
              <Spacer height={32} />
              <ButtonContainer>
                <Button text="Start Browsing" />
                <Spacer width={32} />
                <TextButton text="Galleries To Follow ↓" />
              </ButtonContainer>
            </DesktopHeaderContainer>
            <Spacer height={64} />
            {/* TODO: replace this with recorded video */}
            <img src="./temp-asset.jpg" />
            <Spacer height={64} />
            <DesktopSecondaryHeaderContainer>
              <DesktopStyledSecondaryTitleL>
                Featured galleries to follow
              </DesktopStyledSecondaryTitleL>
              <Spacer height={12} />
              <DesktopDescriptionText>
                To get you started, you can follow some of our past{' '}
                <DesktopDescriptionTextItalic>Gallery of the Week</DesktopDescriptionTextItalic>{' '}
                winners, as voted by our community.
              </DesktopDescriptionText>
            </DesktopSecondaryHeaderContainer>
            <Spacer height={64} />
            <DesktopGalleryOfTheWeekContainer>
              {galleryOfTheWeekWinners.map((userRef) => (
                <GalleryOfTheWeekCard key={userRef.dbid} queryRef={query} userRef={userRef} />
              ))}
            </DesktopGalleryOfTheWeekContainer>
            <Spacer height={80} />
          </>
        )
      }
    </StyledGlobalAnnouncementPopover>
  );
}

const DesktopGotwContainer = styled.div`
  width: 506px;
  height: 506px;
  padding: 16px;
  background: ${colors.white};

  border: 1px solid;
  border-color: ${colors.white};
  cursor: pointer;
  &:hover {
    border-color: ${colors.offBlack};
  }
`;

const StyledGlobalAnnouncementPopover = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${colors.offWhite};
`;

const DesktopHeaderContainer = styled.div`
  width: 580px;
  text-align: center;
`;

const DesktopIntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 84px;
  line-height: 69px;
  letter-spacing: -0.05em;
`;

const DesktopDescriptionText = styled(TitleM)`
  font-style: normal;
`;

const DesktopDescriptionTextItalic = styled.span`
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

const DesktopSecondaryHeaderContainer = styled.div`
  width: 526px;
  text-align: center;
`;

const DesktopStyledSecondaryTitleL = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 42px;
  line-height: 48px;
  letter-spacing: -0.05em;
`;

const DesktopGalleryOfTheWeekContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: 24px;
  max-width: 1040px;
`;

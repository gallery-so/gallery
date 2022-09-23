import { Button } from 'components/core/Button/Button';
import TextButton from 'components/core/Button/TextButton';
import colors from 'components/core/colors';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';
import { removeNullValues } from 'utils/removeNullValues';
import { GlobalAnnouncementPopover$key } from '__generated__/GlobalAnnouncementPopover.graphql';
import GalleryOfTheWeekCard from './Feed/GalleryOfTheWeekCard';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useCallback } from 'react';

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
        viewer {
          ... on Viewer {
            user {
              id
              username
            }
          }
        }
        ...ManageWalletsModalFragment
      }
    `,
    queryRef
  );

  if (query === null) {
    throw new Error('GlobalAnnouncementPopver did not receive gallery of the week winners');
  }

  const { showModal } = useModalActions();

  const { galleryOfTheWeekWinners: rawData } = query;
  const galleryOfTheWeekWinners = removeNullValues(rawData);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  console.log(query);

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const handleManageWalletsClick = useCallback(() => {
    showModal({ content: <ManageWalletsModal queryRef={query} />, headerText: 'Manage accounts' });
  }, [query, showModal]);

  const handleViewTezosGallerisClick = useCallback(() => {
    document.getElementById('featured-tezos')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <StyledGlobalAnnouncementPopover>
      {
        // A note on the architecture:
        // Although desktop and mobile views are similar, they're sufficiently different such that they warrant
        // different sets of components entirely. The alternative would be to litter this file with ternaries
        // and CSS params
        isMobile ? (
          <>
            <VStack gap={24} align="center">
              <MobileHeaderContainer>
                <VStack gap={24}>
                  <VStack gap={8} align="center">
                    <MobileIntroTextContainer>
                      <MobileIntroText>
                        Now supporting <i>Tezos</i>
                      </MobileIntroText>
                    </MobileIntroTextContainer>
                    <MobileDescriptionTextContainer>
                      <BaseM>
                        Starting today, you can connect your Tezos wallets and display your Tezos
                        pieces alongside your Ethereum pieces.
                      </BaseM>
                    </MobileDescriptionTextContainer>
                  </VStack>
                  <MobileButtonContainer>
                    <VStack gap={16} align="center">
                      {isAuthenticated && (
                        <StyledMobileButton onClick={handleManageWalletsClick}>
                          Add your Tezos wallet
                        </StyledMobileButton>
                      )}
                      <TextButton onClick={handleViewTezosGallerisClick} text="Tezos Galleries ↓" />
                    </VStack>
                  </MobileButtonContainer>
                </VStack>
              </MobileHeaderContainer>

              <MobileSecondaryHeaderContainer>
                <VStack gap={12} align="center">
                  <MobileStyledSecondaryTitle>Featured Tezos Collectors</MobileStyledSecondaryTitle>
                  <MobileDescriptionTextContainer>
                    <BaseM>
                      Discover the depth and diversity of pieces on Tezos by exploring these
                      galleries curated by our featured collectors.
                    </BaseM>
                  </MobileDescriptionTextContainer>
                </VStack>
              </MobileSecondaryHeaderContainer>
              <GalleryOfTheWeekContainer id="featured-tezos">
                {galleryOfTheWeekWinners.map((userRef) => (
                  <GalleryOfTheWeekCard key={userRef.dbid} queryRef={query} userRef={userRef} />
                ))}
              </GalleryOfTheWeekContainer>
            </VStack>
          </>
        ) : (
          <>
            <VStack gap={92} align="center">
              <DesktopHeaderContainer>
                <VStack gap={32}>
                  <DesktopIntroText>
                    Now supporting <i>Tezos</i>
                  </DesktopIntroText>
                  <DesktopDescriptionText>
                    Starting today, you can connect your Tezos wallets and display your Tezos pieces
                    alongside your Ethereum pieces.
                  </DesktopDescriptionText>
                  <DesktopButtonContainer>
                    <HStack gap={32}>
                      {isAuthenticated && (
                        <Button onClick={handleManageWalletsClick}>Add your Tezos wallet</Button>
                      )}
                      <TextButton onClick={handleViewTezosGallerisClick} text="Tezos Galleries ↓" />
                    </HStack>
                  </DesktopButtonContainer>
                </VStack>
              </DesktopHeaderContainer>
              <DesktopSecondaryHeaderContainer>
                <VStack gap={12}>
                  <DesktopStyledSecondaryTitle>
                    Featured Tezos Collectors
                  </DesktopStyledSecondaryTitle>
                  <DesktopDescriptionText>
                    Discover the depth and diversity of pieces on Tezos by exploring these galleries
                    curated by our featured collectors.
                  </DesktopDescriptionText>
                </VStack>
              </DesktopSecondaryHeaderContainer>
              <GalleryOfTheWeekContainer id="featured-tezos">
                {galleryOfTheWeekWinners.map((userRef) => (
                  <GalleryOfTheWeekCard key={userRef.dbid} queryRef={query} userRef={userRef} />
                ))}
              </GalleryOfTheWeekContainer>
            </VStack>
          </>
        )
      }
    </StyledGlobalAnnouncementPopover>
  );
}

const StyledGlobalAnnouncementPopover = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: ${colors.offWhite};
  padding: 92px 16px 0px;
`;

////////////////////////// MOBILE //////////////////////////
const MobileHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MobileIntroTextContainer = styled.div`
  width: 245px;
  text-align: center;
`;

const MobileIntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 32px;
  line-height: 32px;
  letter-spacing: -0.05em;
`;

const MobileDescriptionTextContainer = styled.div`
  max-width: 343px;
`;

const MobileButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const StyledMobileButton = styled(Button)`
  width: 100%;
`;

const MobileStyledSecondaryTitle = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 24px;
  line-height: 24px;
  letter-spacing: -0.05em;
`;

const MobileSecondaryHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

////////////////////////// DESKTOP //////////////////////////
const DesktopHeaderContainer = styled.div`
  width: 626px;
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

const DesktopButtonContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const DesktopSecondaryHeaderContainer = styled.div`
  width: 661px;
  text-align: center;
`;

const DesktopStyledSecondaryTitle = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 42px;
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

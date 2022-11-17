import { useRouter } from 'next/router';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import { FragmentRefs } from 'relay-runtime';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import TextButton from '~/components/core/Button/TextButton';
import colors from '~/components/core/colors';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GlobalAnnouncementPopoverFragment$key } from '~/generated/GlobalAnnouncementPopoverFragment.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import ManageWalletsModal from '~/scenes/Modals/ManageWalletsModal';
import { removeNullValues } from '~/utils/removeNullValues';

import FeaturedCollectorCard from './components/FeaturedCollectorCard';

type Props = {
  queryRef: GlobalAnnouncementPopoverFragment$key;
};

export const FEATURED_COLLECTION_IDS = [
  // flamingoDAO
  '2Gd3Zy9WOKnMMySWkdp8hEIqcaE',
  // DCinvestor
  '28MSJGusLMDr7XQC5I4vhdLbib2',
  // iancr
  '27jw0WEcJfsXFyhC9zIMKV8BPij',
  // Phones
  '25HD83fNYagiWsN2fhZZxBpIzoF',
];

// NOTE: in order to toggle whether the modal should appear for authenticated users only,
// refer to `useGlobalAnnouncementPopover.tsx`
export default function GlobalAnnouncementPopover({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment GlobalAnnouncementPopoverFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
              username
            }
          }
        }
        collections: collectionsByIds(ids: $collectionIds) {
          ... on ErrCollectionNotFound {
            __typename
          }
          ... on ErrInvalidInput {
            __typename
          }
          ... on Collection {
            __typename
            dbid
            ...FeaturedCollectorCardCollectionFragment
          }
        }
        ...ManageWalletsModalFragment
        ...useAuthModalFragment
        ...FeaturedCollectorCardFragment
      }
    `,
    queryRef
  );

  if (query === null) {
    throw new Error('GlobalAnnouncementPopver did not receive gallery of the week winners');
  }

  const { showModal, clearAllModals } = useModalActions();

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const handleCreateGalleryClick = useCallback(() => {
    showModal({
      content: <AuthModal queryRef={query} variant="tezos-announcement" />,
      headerText: 'Create account',
    });
  }, [query, showModal]);

  const { push } = useRouter();

  const handleManageWalletsClick = useCallback(() => {
    showModal({
      content: (
        <ManageWalletsModal
          queryRef={query}
          onTezosAddWalletSuccess={() => {
            clearAllModals();
            push({ pathname: '/edit' });
          }}
        />
      ),
      headerText: 'Manage accounts',
    });
  }, [clearAllModals, push, query, showModal]);

  const handleViewTezosGallerisClick = useCallback(() => {
    document.getElementById('featured-tezos')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // TODO: definitely shouldn't have to do this, but for some reason typescript doesn't understand
  // that `.filter` should remove any entities that are not of typename `Collection`
  const collections = (removeNullValues(query.collections).filter(
    (collection) => collection.__typename === 'Collection'
  ) ?? []) as {
    readonly __typename: 'Collection';
    readonly dbid: string;
    readonly ' $fragmentSpreads': FragmentRefs<'FeaturedCollectorCardCollectionFragment'>;
  }[];

  const HEADER_TEXT_1 = 'Introducing the';
  const HEADER_TEXT_2 = 'Next Era of Self Expression';
  const HEADER_DESC_1 =
    'Gallery is a limitless social canvas of curation and connection for your digital objects.';
  const HEADER_DESC_2 = 'Now open to everyone.';
  const BUTTON_TEXT_1 = 'Create Now';
  const BUTTON_TEXT_2 = 'Explore ↓';

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
                      {isAuthenticated ? (
                        <Button onClick={handleManageWalletsClick}>{BUTTON_TEXT_1}</Button>
                      ) : (
                        <Button onClick={handleCreateGalleryClick}>{BUTTON_TEXT_1}</Button>
                      )}
                      <TextButton onClick={handleViewTezosGallerisClick} text={BUTTON_TEXT_2} />
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
              <FeaturedGalleryContainer id="featured-tezos">
                {collections.map((collection) => (
                  <FeaturedCollectorCard
                    key={collection.dbid}
                    queryRef={query}
                    collectionRef={collection}
                  />
                ))}
              </FeaturedGalleryContainer>
            </VStack>
          </>
        ) : (
          <>
            <VStack gap={92} align="center">
              <DesktopHeaderContainer>
                <VStack gap={32}>
                  <VStack>
                    <DesktopIntroText>{HEADER_TEXT_1}</DesktopIntroText>
                    <DesktopIntroText>
                      <i>{HEADER_TEXT_2}</i>
                    </DesktopIntroText>
                  </VStack>
                  <DesktopDescriptionText>
                    {HEADER_DESC_1} <i>{HEADER_DESC_2}</i>
                  </DesktopDescriptionText>
                  <DesktopButtonContainer>
                    <HStack gap={24}>
                      {isAuthenticated ? (
                        <Button onClick={handleManageWalletsClick}>{BUTTON_TEXT_1}</Button>
                      ) : (
                        <Button onClick={handleCreateGalleryClick}>{BUTTON_TEXT_1}</Button>
                      )}
                      <Button onClick={handleViewTezosGallerisClick} variant="secondary">
                        {BUTTON_TEXT_2}
                      </Button>
                    </HStack>
                  </DesktopButtonContainer>
                </VStack>
              </DesktopHeaderContainer>

              <div>Placeholder splash image</div>

              <DesktopSecondaryHeaderContainer>
                <VStack gap={12}>
                  <DesktopStyledSecondaryTitle>
                    Bring your imagination, we’ll handle the rest.
                  </DesktopStyledSecondaryTitle>
                  <DesktopDescriptionText>
                    Multi-chain and multi-wallet. Everything you love in one place.
                  </DesktopDescriptionText>
                  <DesktopDescriptionText>
                    <ul>
                      <li>
                        Your collection has a story, we help you tell it — put together a beautiful
                        and intuitive canvas with just a few clicks.
                      </li>
                      <li>Everything you love displayed exactly how it was meant to be seen.</li>
                      <li>Support for Ethereum, Tezos, and POAPs, with more chains coming soon.</li>
                    </ul>
                  </DesktopDescriptionText>
                </VStack>
              </DesktopSecondaryHeaderContainer>

              <div>Placeholder images</div>

              <DesktopSecondaryHeaderContainer>
                <VStack gap={12}>
                  <DesktopStyledSecondaryTitle>Find your people.</DesktopStyledSecondaryTitle>
                  <DesktopDescriptionText>
                    A creative oasis for curation, connection and exploration. Focus on the art,
                    take a break from the noise.
                  </DesktopDescriptionText>
                  <DesktopDescriptionText>
                    <ul>
                      <li>Explore the communities behind your favorite collections.</li>
                      <li>Connect with other collectors who you vibe with.</li>
                      <li>Join conversations around the work you love.</li>
                    </ul>
                  </DesktopDescriptionText>
                </VStack>
              </DesktopSecondaryHeaderContainer>
              <FeaturedGalleryContainer id="featured-tezos">
                {collections.map((collection) => (
                  <FeaturedCollectorCard
                    key={collection.dbid}
                    queryRef={query}
                    collectionRef={collection}
                  />
                ))}
              </FeaturedGalleryContainer>
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
  background: ${colors.white};
  padding: 92px 16px;

  min-height: 100vh;

  button {
    width: 130px;
  }
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
const DesktopDescriptionText = styled(TitleM)`
  font-style: normal;
`;

const DesktopHeaderContainer = styled.div`
  max-width: 800px;
  text-align: center;

  ${DesktopDescriptionText} {
    max-width: 640px;
  }
`;

const DesktopIntroText = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 84px;
  line-height: 69px;
  letter-spacing: -0.05em;
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

const FeaturedGalleryContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: 24px;
  max-width: 1040px;
`;

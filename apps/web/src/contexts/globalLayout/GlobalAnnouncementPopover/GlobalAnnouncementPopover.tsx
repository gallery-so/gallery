import Image from 'next/image';
import { useRouter } from 'next/router';
import SplashImage1 from 'public/gallery_social_splash.png';
import SplashImage2 from 'public/gallery_social_splash_2.png';
import { useCallback, useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GlobalAnnouncementPopoverFragment$key } from '~/generated/GlobalAnnouncementPopoverFragment.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { useIsDesktopWindowWidth } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import FeaturedCollectorCard from './components/FeaturedCollectorCard';

type Props = {
  queryRef: GlobalAnnouncementPopoverFragment$key;
};

export const FEATURED_COLLECTION_IDS = [
  // flamingoDAO
  '2Gd3Zy9WOKnMMySWkdp8hEIqcaE',
  // DCinvestor
  '28MVRr0fTeWIJFnOrOzKLBJ9Kn4',
  // Phones
  '2HZ66Wbw3XW3zZWPcO9tDINCmeN',
  // iancr
  '26sDkAJhoGgauOFPcd5icLyATJv',
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
        ...useAuthModalFragment
        ...FeaturedCollectorCardFragment
      }
    `,
    queryRef
  );

  if (query === null) {
    throw new Error('GlobalAnnouncementPopver did not receive gallery of the week winners');
  }

  const { showModal, hideModal } = useModalActions();

  const isMobile = !useIsDesktopWindowWidth();

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const { push } = useRouter();

  const handlePrimaryButtonClick = useCallback(() => {
    hideModal();

    if (isAuthenticated) {
      push({ pathname: '/home' });
      return;
    }

    showModal({
      content: <AuthModal queryRef={query} />,
      headerText: 'Create account',
    });
  }, [hideModal, isAuthenticated, push, query, showModal]);

  const handleSecondaryButtonClick = useCallback(() => {
    document.getElementById('beautiful-home')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const collections = useMemo(() => {
    const collections = [];

    for (const collection of query.collections ?? []) {
      if (collection?.__typename === 'Collection') {
        collections.push(collection);
      }
    }

    return collections;
  }, [query.collections]);

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
          <MobilePopoverContainer gap={32} align="center">
            <MobileHeaderContainer>
              <VStack gap={24}>
                <VStack gap={16} align="center">
                  <MobileIntroTextContainer>
                    <MobileIntroText>{HEADER_TEXT_1}</MobileIntroText>
                    <MobileIntroText>
                      <i>{HEADER_TEXT_2}</i>
                    </MobileIntroText>
                  </MobileIntroTextContainer>
                  <BaseM>
                    {HEADER_DESC_1} {HEADER_DESC_2}
                  </BaseM>
                </VStack>
                <MobileButtonContainer>
                  <VStack gap={16} align="center">
                    <Button onClick={handlePrimaryButtonClick}>{BUTTON_TEXT_1}</Button>
                  </VStack>
                </MobileButtonContainer>
              </VStack>
            </MobileHeaderContainer>

            <Image src={SplashImage1} alt="splash-image" />

            <MobileSecondaryHeaderContainer>
              <VStack gap={12} align="center">
                <MobileStyledSecondaryTitle>
                  Your collection deserves a beautiful home.
                </MobileStyledSecondaryTitle>
                <MobileDescriptionTextContainer>
                  <BaseM>Multi-chain and multi-wallet. Everything you love in one place.</BaseM>
                </MobileDescriptionTextContainer>
              </VStack>
            </MobileSecondaryHeaderContainer>

            <VStack gap={16}>
              <ValueProp>
                <BaseM>
                  <b>Simple and intuitive</b>
                </BaseM>
                <BaseM>Create a beautiful page with just a few clicks.</BaseM>
              </ValueProp>
              <ValueProp>
                <BaseM>
                  <b>Multi-chain</b>
                </BaseM>
                <BaseM>
                  Display Ethereum, Tezos, and POAP NFTs together, with more chains coming soon.
                </BaseM>
              </ValueProp>
              <ValueProp>
                <BaseM>
                  <b>Expressive</b>
                </BaseM>
                <BaseM>
                  Your collection has a story – share it the way it was meant to be told.
                </BaseM>
              </ValueProp>
            </VStack>

            <Image src={SplashImage2} alt="splash-image" />

            <MobileSecondaryHeaderContainer>
              <VStack gap={12} align="center">
                <MobileStyledSecondaryTitle>Find your people.</MobileStyledSecondaryTitle>
                <MobileDescriptionTextContainer>
                  <BaseM>
                    A creative oasis for curation, connection, and exploration. Focus on the art,
                    take a break from the noise.
                  </BaseM>
                </MobileDescriptionTextContainer>
              </VStack>
            </MobileSecondaryHeaderContainer>

            <VStack gap={16}>
              <ValueProp>
                <BaseM>
                  <b>Explorations</b>
                </BaseM>
                <BaseM>Discover the communities behind your favorite collections.</BaseM>
              </ValueProp>
              <ValueProp>
                <BaseM>
                  <b>Connections</b>
                </BaseM>
                <BaseM>Follow others based on their taste and stay updated.</BaseM>
              </ValueProp>
              <ValueProp>
                <BaseM>
                  <b>Conversations</b>
                </BaseM>
                <BaseM>Comment on the latest activities from friends.</BaseM>
              </ValueProp>
            </VStack>

            <FeaturedGalleryContainer>
              {collections.map((collection) => (
                <FeaturedCollectorCard
                  key={collection.dbid}
                  queryRef={query}
                  collectionRef={collection}
                />
              ))}
            </FeaturedGalleryContainer>

            <DesktopFooterContainer gap={16} align="center">
              <MobileSecondaryHeaderContainer gap={4}>
                <HStack gap={6} justify="center">
                  <MobileStyledSecondaryTitle>Welcome to</MobileStyledSecondaryTitle>
                  <MobileStyledLogo src="/icons/logo-large-2.svg" />
                </HStack>
                <BaseM>Share your taste with the world.</BaseM>
              </MobileSecondaryHeaderContainer>
              <Button onClick={handlePrimaryButtonClick}>{BUTTON_TEXT_1}</Button>
            </DesktopFooterContainer>
          </MobilePopoverContainer>
        ) : (
          <DesktopPopoverContainer gap={80} align="center">
            <DesktopHeaderContainer>
              <VStack gap={32} align="center">
                <VStack>
                  <DesktopIntroText>{HEADER_TEXT_1}</DesktopIntroText>
                  <DesktopIntroText>
                    <i>{HEADER_TEXT_2}</i>
                  </DesktopIntroText>
                </VStack>
                <DesktopDescriptionText>
                  {HEADER_DESC_1} {HEADER_DESC_2}
                </DesktopDescriptionText>
                <DesktopButtonContainer>
                  <HStack gap={24}>
                    <Button onClick={handlePrimaryButtonClick}>{BUTTON_TEXT_1}</Button>
                    <Button onClick={handleSecondaryButtonClick} variant="secondary">
                      {BUTTON_TEXT_2}
                    </Button>
                  </HStack>
                </DesktopButtonContainer>
              </VStack>
            </DesktopHeaderContainer>

            <DesktopSplashImageContainer1>
              <Image src={SplashImage1} alt="splash-image" />
            </DesktopSplashImageContainer1>

            <DesktopSecondarySectionContainer align="center" id="beautiful-home">
              <VStack gap={64} align="center">
                <DesktopSecondaryHeaderContainer gap={12}>
                  <DesktopStyledSecondaryTitle>
                    Your collection deserves a beautiful home.
                  </DesktopStyledSecondaryTitle>
                  <DesktopSecondaryDescription>
                    Multi-chain and multi-wallet. Everything you love in one place.
                  </DesktopSecondaryDescription>
                </DesktopSecondaryHeaderContainer>
                <HStack gap={16}>
                  <ValueProp>
                    <DesktopSecondaryDescription>
                      <b>Simple and intuitive</b>
                    </DesktopSecondaryDescription>
                    <DesktopSecondaryDescription>
                      Create a beautiful page with just a few clicks.
                    </DesktopSecondaryDescription>
                  </ValueProp>
                  <ValueProp>
                    <DesktopSecondaryDescription>
                      <b>Multi-chain</b>
                    </DesktopSecondaryDescription>
                    <DesktopSecondaryDescription>
                      Display Ethereum, Tezos, and POAP NFTs together, with more chains coming soon.
                    </DesktopSecondaryDescription>
                  </ValueProp>
                  <ValueProp>
                    <DesktopSecondaryDescription>
                      <b>Expressive</b>
                    </DesktopSecondaryDescription>
                    <DesktopSecondaryDescription>
                      Your collection has a story – share it the way it was meant to be told.
                    </DesktopSecondaryDescription>
                  </ValueProp>
                </HStack>
              </VStack>
            </DesktopSecondarySectionContainer>

            <DesktopSplashImageContainer2>
              <Image src={SplashImage2} alt="splash-image" />
            </DesktopSplashImageContainer2>

            <DesktopSecondarySectionContainer align="center">
              <VStack gap={64} align="center">
                <DesktopSecondaryHeaderContainer gap={12}>
                  <DesktopStyledSecondaryTitle>Find your people.</DesktopStyledSecondaryTitle>
                  <DesktopSecondaryDescription>
                    A creative oasis for curation, connection and exploration. Focus on the art,
                    take a break from the noise.
                  </DesktopSecondaryDescription>
                </DesktopSecondaryHeaderContainer>

                <HStack gap={16}>
                  <ValueProp>
                    <DesktopSecondaryDescription>
                      <b>Explorations</b>
                    </DesktopSecondaryDescription>
                    <DesktopSecondaryDescription>
                      Discover the communities behind your favorite collections.
                    </DesktopSecondaryDescription>
                  </ValueProp>
                  <ValueProp>
                    <DesktopSecondaryDescription>
                      <b>Connections</b>
                    </DesktopSecondaryDescription>
                    <DesktopSecondaryDescription>
                      Follow others based on their taste and stay updated.
                    </DesktopSecondaryDescription>
                  </ValueProp>
                  <ValueProp>
                    <DesktopSecondaryDescription>
                      <b>Conversations</b>
                    </DesktopSecondaryDescription>
                    <DesktopSecondaryDescription>
                      Comment on the latest activities from friends.
                    </DesktopSecondaryDescription>
                  </ValueProp>
                </HStack>
              </VStack>
            </DesktopSecondarySectionContainer>

            <FeaturedGalleryContainer>
              {collections.map((collection) => (
                <FeaturedCollectorCard
                  key={collection.dbid}
                  queryRef={query}
                  collectionRef={collection}
                />
              ))}
            </FeaturedGalleryContainer>

            <DesktopFooterContainer gap={32} align="center">
              <DesktopSecondaryHeaderContainer gap={12}>
                <HStack gap={12} justify="center">
                  <DesktopStyledSecondaryTitle>Welcome to</DesktopStyledSecondaryTitle>
                  <DesktopStyledLogo src="/icons/logo-large-2.svg" />
                </HStack>
                <DesktopSecondaryDescription>
                  Share your taste with the world.
                </DesktopSecondaryDescription>
              </DesktopSecondaryHeaderContainer>
              <Button onClick={handlePrimaryButtonClick}>{BUTTON_TEXT_1}</Button>
            </DesktopFooterContainer>
          </DesktopPopoverContainer>
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

  min-height: 100vh;
`;

////////////////////////// MOBILE //////////////////////////
const MobilePopoverContainer = styled(VStack)`
  padding: 80px 16px;
`;

const MobileHeaderContainer = styled.div`
  max-width: 343px;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const MobileIntroTextContainer = styled(VStack)`
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

const MobileSecondaryHeaderContainer = styled(VStack)`
  align-items: center;
`;

const MobileStyledLogo = styled.img`
  height: 24px;
`;

////////////////////////// DESKTOP //////////////////////////
const DesktopPopoverContainer = styled(VStack)`
  padding: 80px;

  button {
    font-size: 18px;
    width: 190px;
    height: 48px;
  }
`;

const DesktopDescriptionText = styled.span`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 24px;
  line-height: 28px;
  letter-spacing: -0.03em;
`;

const DesktopHeaderContainer = styled(VStack)`
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

const DesktopSplashImageContainer1 = styled.div`
  max-width: 1000px;
`;

const DesktopSplashImageContainer2 = styled.div`
  max-width: 1200px;
`;

const DesktopSecondarySectionContainer = styled(VStack)`
  text-align: center;
`;

const DesktopSecondaryHeaderContainer = styled(VStack)`
  width: 660px;
`;

const DesktopStyledSecondaryTitle = styled.span`
  // TODO [GAL-273]: once we've defined marketing-specific font families, standardize this in Text.tsx
  font-family: 'GT Alpina Condensed';
  font-size: 72px;
  line-height: 64px;
  letter-spacing: -0.05em;
`;

const DesktopSecondaryDescription = styled.span`
  font-family: ${BODY_FONT_FAMILY};
  font-size: 24px;
  line-height: 28px;
  letter-spacing: -0.03em;
`;

const ValueProp = styled(VStack)`
  width: 344px;
  text-align: left;
`;

const FeaturedGalleryContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  grid-gap: 24px;
  max-width: 1040px;
`;

const DesktopFooterContainer = styled(VStack)`
  text-align: center;
  padding-bottom: 30px;
`;

const DesktopStyledLogo = styled.img`
  height: 70px;
`;

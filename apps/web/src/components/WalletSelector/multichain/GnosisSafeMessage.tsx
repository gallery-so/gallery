import { contexts } from 'shared/analytics/constants';
import styled from 'styled-components';

import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { GALLERY_TWITTER, GALLERY_WARPCAST_CHANNEL } from '~/constants/urls';

import { walletIconMap } from './WalletButton';

export function GnosisSafeMessage() {
  return (
    <EmptyState title="">
      <VStack gap={24}>
        <VStack align="center" gap={4}>
          <Icon src={walletIconMap['gnosis_safe']} />
          <TitleS>Connect with Gnosis Safe</TitleS>
        </VStack>
        <VStack align="flex-start">
          <TitleS>New users</TitleS>
          <StyledText>
            Please create a Gallery account using Email, Farcaster, or hot wallet, then reach out to
            our team via{' '}
            <GalleryLink
              href={GALLERY_TWITTER}
              eventElementId="Twitter Link"
              eventName="Twitter Link Click"
              eventContext={contexts.Authentication}
            >
              Twitter
            </GalleryLink>{' '}
            or{' '}
            <GalleryLink
              href={GALLERY_WARPCAST_CHANNEL}
              eventElementId="Farcaster Link"
              eventName="Farcaster Link Click"
              eventContext={contexts.Authentication}
            >
              Farcaster
            </GalleryLink>{' '}
            and we will link your Gnosis address for you.
          </StyledText>
        </VStack>
        <VStack align="flex-start">
          <TitleS>Existing users</TitleS>
          <StyledText>
            If you'd like to connect your Gnosis address to an existing Gallery account, please
            reach out to our team via{' '}
            <GalleryLink
              href={GALLERY_TWITTER}
              eventElementId="Twitter Link"
              eventName="Twitter Link Click"
              eventContext={contexts.Authentication}
            >
              Twitter
            </GalleryLink>{' '}
            or{' '}
            <GalleryLink
              href={GALLERY_WARPCAST_CHANNEL}
              eventElementId="Farcaster Link"
              eventName="Farcaster Link Click"
              eventContext={contexts.Authentication}
            >
              Farcaster
            </GalleryLink>
            .
          </StyledText>
        </VStack>
      </VStack>
    </EmptyState>
  );
}

const StyledText = styled(BaseM)`
  text-align: left;
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  margin: 5px;

  transform: scale(1);
  transition: transform ${transitions.cubic};
`;

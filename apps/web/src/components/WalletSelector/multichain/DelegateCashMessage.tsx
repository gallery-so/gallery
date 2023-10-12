import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import GalleryLink from '~/components/core/GalleryLink/GalleryLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleS } from '~/components/core/Text/Text';
import transitions from '~/components/core/transitions';
import { EmptyState } from '~/components/EmptyState/EmptyState';
import { GALLERY_DISCORD, GALLERY_TWITTER } from '~/constants/urls';
import { contexts } from '~/shared/analytics/constants';

import { walletIconMap } from './WalletButton';

type Props = {
  reset: () => void;
};

export default function DelegateCashMessage({ reset }: Props) {
  return (
    <EmptyState title="">
      <VStack gap={24}>
        <VStack align="center" gap={4}>
          <Icon src={walletIconMap['delegate_cash']} />
          <TitleS>Delegate Cash Coming Soon</TitleS>
        </VStack>
        <VStack align="flex-start">
          <TitleS>What is it?</TitleS>
          <StyledText>
            <GalleryLink
              href={'https://delegate.cash'}
              eventElementId="Delegate Cash Link"
              eventName="Delegate Cash Link Click"
              eventContext={contexts.Authentication}
            >
              Delegate Cash
            </GalleryLink>{' '}
            is a decentralized service that allows you to designate a hot wallet to act and sign on
            behalf of your cold wallet.
          </StyledText>
        </VStack>
        <VStack align="flex-start">
          <TitleS>New users</TitleS>
          <StyledText>
            Please create a Gallery account with your delegated hot wallet, then reach out to our
            team via{' '}
            <GalleryLink
              href={GALLERY_DISCORD}
              eventElementId="Discord Link"
              eventName="Discord Link Click"
              eventContext={contexts.Authentication}
            >
              Discord
            </GalleryLink>{' '}
            or{' '}
            <GalleryLink
              href={GALLERY_TWITTER}
              eventElementId="Twitter Link"
              eventName="Twitter Link Click"
              eventContext={contexts.Authentication}
            >
              Twitter
            </GalleryLink>{' '}
            for next steps.
          </StyledText>
        </VStack>
        <VStack align="flex-start">
          <TitleS>Existing users</TitleS>
          <StyledText>
            If you’d like to connect your cold wallet to an existing Gallery account, please reach
            out to the Gallery team via{' '}
            <GalleryLink
              href={GALLERY_DISCORD}
              eventElementId="Discord Link"
              eventName="Discord Link Click"
              eventContext={contexts.Authentication}
            >
              Discord
            </GalleryLink>{' '}
            or{' '}
            <GalleryLink
              href={GALLERY_TWITTER}
              eventElementId="Twitter Link"
              eventName="Twitter Link Click"
              eventContext={contexts.Authentication}
            >
              Twitter
            </GalleryLink>
            .
          </StyledText>
        </VStack>
        <Button
          // no need to track backing out of informational dialog
          eventElementId={null}
          eventName={null}
          eventContext={null}
          onClick={reset}
        >
          Back
        </Button>
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

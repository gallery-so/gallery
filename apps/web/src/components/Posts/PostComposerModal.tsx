import { Suspense, useCallback, useState } from 'react';
import styled from 'styled-components';

import { NftSelectorLoadingView } from '~/components/NftSelector/NftSelectorLoadingView';
import ErrorBoundary from '~/contexts/boundary/ErrorBoundary';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { contexts } from '~/shared/analytics/constants';
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import { useClearURLQueryParams } from '~/utils/useClearURLQueryParams';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import { VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { NftSelector, NftSelectorContractType } from '../NftSelector/NftSelector';
import DiscardPostConfirmation from './DiscardPostConfirmation';
import PostComposer from './PostComposer';

type Props = {
  preSelectedContract?: NftSelectorContractType;
  eventFlow?: GalleryElementTrackingProps['eventFlow'];
};

// Modal with multiple steps: the NFT Selector -> then Post Composer
export function PostComposerModalWithSelector({ preSelectedContract, eventFlow }: Props) {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const track = useTrack();

  const onSelectToken = useCallback(
    (tokenId: string) => {
      track('Select Token on Post Composer Modal', {
        context: contexts.Posts,
        flow: eventFlow,
      });
      setSelectedTokenId(tokenId);
    },
    [eventFlow, track]
  );

  const returnUserToSelectorStep = useCallback(() => {
    setSelectedTokenId(null);
  }, []);

  useClearURLQueryParams('composer');

  const { showModal } = useModalActions();

  const { captionRef, clearUrlParamsAndSelections } = usePostComposerContext();

  const onBackClick = useCallback(() => {
    track('Back Click on Post Composer Modal', {
      context: contexts.Posts,
      flow: eventFlow,
    });

    if (!captionRef.current) {
      returnUserToSelectorStep();
      return;
    }

    showModal({
      headerText: 'Are you sure?',
      content: (
        <DiscardPostConfirmation
          onSaveDraft={() => {
            returnUserToSelectorStep();
          }}
          onDiscard={() => {
            returnUserToSelectorStep();
            clearUrlParamsAndSelections();
          }}
        />
      ),
      isFullPage: false,
    });
  }, [
    track,
    eventFlow,
    captionRef,
    showModal,
    returnUserToSelectorStep,
    clearUrlParamsAndSelections,
  ]);

  return (
    <StyledPostComposerModal>
      <ErrorBoundary fallback={<PostComposerErrorScreen />}>
        {selectedTokenId ? (
          // Just in case the PostComposer's token isn't already in the cache, we'll have a fallback
          <Suspense fallback={<NftSelectorLoadingView />}>
            <PostComposer
              onBackClick={onBackClick}
              tokenId={selectedTokenId}
              eventFlow={eventFlow}
            />
          </Suspense>
        ) : (
          <NftSelector
            onSelectToken={onSelectToken}
            headerText={'Select item to post'}
            preSelectedContract={preSelectedContract}
            eventFlow={eventFlow}
          />
        )}
      </ErrorBoundary>
    </StyledPostComposerModal>
  );
}

type PostComposerModalProps = {
  tokenId: string;
  eventFlow?: GalleryElementTrackingProps['eventFlow'];
};

// Modal with a single step, the Post Composer.
export function PostComposerModal({ tokenId, eventFlow }: PostComposerModalProps) {
  useClearURLQueryParams('composer');
  return (
    <StyledPostComposerModal>
      <ErrorBoundary fallback={<PostComposerErrorScreen />}>
        <PostComposer tokenId={tokenId} eventFlow={eventFlow} />
      </ErrorBoundary>
    </StyledPostComposerModal>
  );
}

const StyledPostComposerModal = styled.div`
  width: 100%;
  height: 100%;
  @media only screen and ${breakpoints.tablet} {
    min-width: 562px;
    min-height: 274px;
  }
`;

function PostComposerErrorScreen() {
  const { hideModal } = useModalActions();

  const handleCloseClick = useCallback(() => {
    hideModal();
  }, [hideModal]);

  return (
    <StyledErrorScreen>
      <StyledErrorContent gap={16} align="center">
        <BaseM>
          Sorry, there was an error while composing your post. The Gallery team has been notified.
        </BaseM>
        <RetryButton
          eventElementId={null}
          eventName={null}
          eventContext={null}
          onClick={handleCloseClick}
        >
          Close
        </RetryButton>
      </StyledErrorContent>
    </StyledErrorScreen>
  );
}

const StyledErrorScreen = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const StyledErrorContent = styled(VStack)`
  width: 340px;
  text-align: center;
`;

const RetryButton = styled(Button)`
  width: fit-content;
`;

import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import ErrorBoundary from '~/contexts/boundary/ErrorBoundary';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { PostComposerModalFragment$key } from '~/generated/PostComposerModalFragment.graphql';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import { VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { NftSelector, NftSelectorContractType } from '../NftSelector/NftSelector';
import DiscardPostConfirmation from './DiscardPostConfirmation';
import PostComposer from './PostComposer';

type Props = {
  preSelectedContract?: NftSelectorContractType;
};

// Modal with multiple steps: the NFT Selector -> then Post Composer
export function PostComposerModalWithSelector({ preSelectedContract }: Props) {
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);

  const onSelectToken = useCallback((tokenId: string) => {
    setSelectedTokenId(tokenId);
  }, []);

  const returnUserToSelectorStep = useCallback(() => {
    setSelectedTokenId(null);
  }, []);

  const { showModal } = useModalActions();

  const { captionRef, setCaption } = usePostComposerContext();

  const onBackClick = useCallback(() => {
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
            setCaption('');
          }}
        />
      ),
      isFullPage: false,
    });
  }, [captionRef, showModal, returnUserToSelectorStep, setCaption]);

  const selectedToken = null;

  return (
    <StyledPostComposerModal>
      <ErrorBoundary fallback={<PostComposerErrorScreen />}>
        {selectedToken ? (
          <PostComposer onBackClick={onBackClick} tokenRef={selectedToken} />
        ) : (
          <NftSelector
            onSelectToken={onSelectToken}
            headerText={'Select item to post'}
            preSelectedContract={preSelectedContract}
          />
        )}
      </ErrorBoundary>
    </StyledPostComposerModal>
  );
}

type PostComposerModalProps = {
  tokenRef: PostComposerModalFragment$key;
};

// Modal with a single step, the Post Composer.
export function PostComposerModal({ tokenRef }: PostComposerModalProps) {
  const token = useFragment(
    graphql`
      fragment PostComposerModalFragment on Token {
        ...PostComposerFragment
      }
    `,
    tokenRef
  );
  return (
    <StyledPostComposerModal>
      <ErrorBoundary fallback={<PostComposerErrorScreen />}>
        <PostComposer tokenRef={token} />
      </ErrorBoundary>
    </StyledPostComposerModal>
  );
}

const StyledPostComposerModal = styled.div`
  width: 100%;
  height: 100%;
  @media only screen and ${breakpoints.tablet} {
    min-width: 562px;
    min-height: 344px;
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
        <RetryButton onClick={handleCloseClick}>Close</RetryButton>
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

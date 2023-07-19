import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import ErrorBoundary from '~/contexts/boundary/ErrorBoundary';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { PostComposerFragment$key } from '~/generated/PostComposerFragment.graphql';
import { PostComposerModalFragment$key } from '~/generated/PostComposerModalFragment.graphql';
import { PostComposerModalWithSelectorFragment$key } from '~/generated/PostComposerModalWithSelectorFragment.graphql';
import { PostComposerModalWithSelectorQueryFragment$key } from '~/generated/PostComposerModalWithSelectorQueryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import breakpoints from '../core/breakpoints';
import { Button } from '../core/Button/Button';
import { VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { NftSelector } from '../NftSelector/NftSelector';
import PostComposer from './PostComposer';

type Props = {
  tokensRef: PostComposerModalWithSelectorFragment$key;
  queryRef: PostComposerModalWithSelectorQueryFragment$key;
};

// Modal with a multiple steps: the NFT Selector -> then Post Composer
export function PostComposerModalWithSelector({ tokensRef, queryRef }: Props) {
  const tokens = useFragment(
    graphql`
      fragment PostComposerModalWithSelectorFragment on Token @relay(plural: true) {
        ...NftSelectorFragment
      }
    `,
    tokensRef
  );

  const query = useFragment(
    graphql`
      fragment PostComposerModalWithSelectorQueryFragment on Query {
        ...NftSelectorQueryFragment
      }
    `,
    queryRef
  );

  const nonNullTokens = removeNullValues(tokens ?? []);

  const [selectedToken, setSelectedToken] = useState<PostComposerFragment$key | null>(null);

  const onSelectToken = useCallback((token: PostComposerFragment$key) => {
    setSelectedToken(token);
  }, []);

  const clearSelectedTokenId = useCallback(() => {
    setSelectedToken(null);
  }, []);

  return (
    <StyledPostComposerModal>
      <ErrorBoundary fallback={<PostComposerErrorScreen />}>
        {selectedToken ? (
          <PostComposer onBackClick={clearSelectedTokenId} tokenRef={selectedToken} />
        ) : (
          <NftSelector
            tokensRef={nonNullTokens}
            queryRef={query}
            onSelectToken={onSelectToken}
            headerText={'Select item to post'}
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

import { useRouter } from 'next/router';
import { Suspense, useEffect } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import NftDetailPage from '~/scenes/NftDetailPage/NftDetailPage';
import { LoadableTokenDetailView } from '~/scenes/TokenDetailPage/TokenDetailView';

import { useModalActions, useModalState } from '../modal/ModalContext';

// This component listens globally for clients transitioning to an NFT Detail Modal Route.
// If users are pushed to that route, a modal will be triggered with a pseudo-transition
// while the previous route remains mounted in the background.
//
// This file works in tandem with `LinkToTokenDetailView.tsx`
export default function FullPageNftDetailModalListener() {
  const { isModalOpenRef } = useModalState();
  const { showModal } = useModalActions();
  const { pathname, query, push } = useRouter();

  const { username, collectionId, tokenId, originPage, modalVariant } = query;

  useEffect(() => {
    if (modalVariant !== 'nft_detail') {
      return;
    }

    // avoid doubling up on modals
    if (isModalOpenRef.current) {
      return;
    }

    // all NFT Detail routes must have at least one of the two
    if (!username || !tokenId) {
      return;
    }

    const content = collectionId ? (
      <Suspense fallback={<FullPageLoader />}>
        <NftDetailPage
          username={username as string}
          collectionId={collectionId as string}
          tokenId={tokenId as string}
        />
      </Suspense>
    ) : (
      <StyledTokenPreviewModal>
        <Suspense fallback={<FullPageLoader />}>
          <LoadableTokenDetailView tokenId={tokenId as string} />
        </Suspense>
      </StyledTokenPreviewModal>
    );

    showModal({
      isFullPage: true,
      content,
      onClose: async () => {
        await push(
          // @ts-expect-error originPage is guaranteed to be a valid path
          originPage as string,
          undefined,
          // prevent scroll-to-top when exiting the modal
          { scroll: false }
        );
      },
    });
  }, [
    collectionId,
    showModal,
    push,
    pathname,
    isModalOpenRef,
    username,
    tokenId,
    query,
    originPage,
    modalVariant,
  ]);

  return null;
}

const StyledTokenPreviewModal = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 80px 0;

  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;

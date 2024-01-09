import { useRouter } from 'next/router';
import { Suspense, useEffect } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import NftDetailPage from '~/scenes/NftDetailPage/NftDetailPage';
import NftDetailPageFallback from '~/scenes/NftDetailPage/NftDetailPageFallback';
import { LoadableTokenDetailView } from '~/scenes/TokenDetailPage/TokenDetailView';

import { useModalActions, useModalState } from '../modal/ModalContext';

/**
 * IMPORTANT! The mechanics of this listener is tied to `LinkToFullPageNftDetailModal.tsx`
 *
 * This component listens globally for clients transitioning to an NFT Detail Modal Route.
 * If users are pushed to that route, a modal will be triggered with a pseudo-transition
 * while the previous route remains mounted in the background.
 *
 * How this works: https://www.loom.com/share/00e33659ade1413d8059896e8347d049?sid=f2a8d569-3742-477b-95aa-991512a1c630
 */
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

    // all NFT Detail routes must have have both provided
    if (!username || !tokenId || typeof tokenId !== 'string') {
      return;
    }

    const content = collectionId ? (
      <Suspense fallback={<NftDetailPageFallback tokenId={tokenId} />}>
        <NftDetailPage
          username={username as string}
          collectionId={collectionId as string}
          tokenId={tokenId}
        />
      </Suspense>
    ) : (
      <StyledTokenPreviewModal>
        <Suspense fallback={<NftDetailPageFallback tokenId={tokenId} />}>
          <LoadableTokenDetailView tokenId={tokenId} />
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

  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;

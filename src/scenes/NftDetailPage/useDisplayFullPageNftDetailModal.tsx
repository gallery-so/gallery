import FullPageLoader from 'components/core/Loader/FullPageLoader';
import { useModalActions, useModalState } from 'contexts/modal/ModalContext';
import { useRouter } from 'next/router';
import { useEffect, Suspense } from 'react';
import NftDetailPage from './NftDetailPage';

// displays a full-screen NFT Detail Modal if the route is detected to follow /username/collectionId/nftId.
// the actual component that uses this hook will remain intact in the background.
export default function useDisplayFullPageNftDetailModal() {
  const { isActive: isModalActive } = useModalState();
  const { showModal } = useModalActions();
  const {
    pathname,
    query: { username, collectionId, nftId, originPage },
    push,
  } = useRouter();

  // TODO: get whether modal is mounted from context, so we don't re-open
  // another modal as the user transitions between NFT detail page
  const returnTo = originPage === 'gallery' ? `/${username}` : `/${username}/${collectionId}`;

  useEffect(() => {
    if (nftId && collectionId && !isModalActive) {
      // have to do this weird check on query param types
      if (Array.isArray(collectionId) || Array.isArray(nftId)) {
        return;
      }

      showModal(
        <Suspense fallback={<FullPageLoader />}>
          <NftDetailPage collectionId={collectionId} nftId={nftId} />
        </Suspense>,
        () => push(returnTo),
        true
      );
    }
  }, [collectionId, nftId, showModal, push, pathname, returnTo, isModalActive]);
}

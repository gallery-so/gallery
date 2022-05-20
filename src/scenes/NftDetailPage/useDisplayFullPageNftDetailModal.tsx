import FullPageLoader from 'components/core/Loader/FullPageLoader';
import { useModalActions, useModalState } from 'contexts/modal/ModalContext';
import { useRouter } from 'next/router';
import { useEffect, Suspense } from 'react';
import NftDetailPage from './NftDetailPage';

// displays a full-screen NFT Detail Modal if the route is detected to follow /username/collectionId/nftId.
// the actual component that uses this hook will remain intact in the background.
export default function useDisplayFullPageNftDetailModal() {
  const { isModalOpenRef } = useModalState();
  const { showModal } = useModalActions();
  const {
    pathname,
    query: { username, collectionId, nftId, originPage },
    push,
  } = useRouter();

  const returnTo = originPage === 'gallery' ? `/${username}` : `/${username}/${collectionId}`;

  useEffect(() => {
    if (nftId && collectionId && !isModalOpenRef.current) {
      // have to do this weird check on query param types
      if (Array.isArray(collectionId) || Array.isArray(nftId)) {
        return;
      }

      showModal(
        <Suspense fallback={<FullPageLoader />}>
          <NftDetailPage collectionId={collectionId} nftId={nftId} />
        </Suspense>,
        () =>
          push(
            returnTo,
            undefined,
            // prevent scroll-to-top when exiting the modal
            { scroll: false }
          ),
        true
      );
    }
  }, [collectionId, nftId, showModal, push, pathname, returnTo, isModalOpenRef]);
}

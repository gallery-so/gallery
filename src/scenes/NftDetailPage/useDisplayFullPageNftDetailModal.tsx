import { useRouter } from 'next/router';
import { Suspense, useEffect } from 'react';

import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import { useModalActions, useModalState } from '~/contexts/modal/ModalContext';

import NftDetailPage from './NftDetailPage';

// displays a full-screen NFT Detail Modal if the route is detected to follow /username/collectionId/tokenId.
// the actual component that uses this hook will remain intact in the background.
export default function useDisplayFullPageNftDetailModal() {
  const { isModalOpenRef } = useModalState();
  const { showModal } = useModalActions();
  const { pathname, query, push } = useRouter();

  const { username, collectionId, tokenId, originPage } = query;

  useEffect(() => {
    if (!username || !tokenId || !collectionId || isModalOpenRef.current) {
      return;
    }

    showModal({
      content: (
        <Suspense fallback={<FullPageLoader />}>
          <NftDetailPage
            username={username as string}
            collectionId={collectionId as string}
            tokenId={tokenId as string}
          />
        </Suspense>
      ),
      onClose: async () => {
        console.log(originPage);
        await push(
          // @ts-expect-error originPage is guaranteed to be a valid path
          originPage as string,
          undefined,
          // prevent scroll-to-top when exiting the modal
          { scroll: false }
        );
      },

      isFullPage: true,
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
  ]);
}

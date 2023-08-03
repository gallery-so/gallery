import { useRouter } from 'next/router';
import { Suspense, useEffect } from 'react';

import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import NftDetailPage from '~/scenes/NftDetailPage/NftDetailPage';

import { useModalActions, useModalState } from '../modal/ModalContext';

// displays a full-screen NFT Detail Modal if the route is detected to follow /username/collectionId/tokenId.
// the actual component that uses this hook will remain intact in the background.

// This component listens globally for clients transitioning to an NFT Detail Modal Route.
// If users are pushed to that route, a modal will be triggered.
//
// This file works in tandem with `LinkToTokenDetailView.tsx`
export default function FullPageNftDetailModalListener() {
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

  return null;
}

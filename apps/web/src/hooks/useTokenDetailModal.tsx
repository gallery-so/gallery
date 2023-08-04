import { useRouter } from 'next/router';
import { Suspense, useCallback } from 'react';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { LoadableTokenDetailView } from '~/scenes/TokenDetailPage/TokenDetailView';

export default function useTokenDetailModal() {
  const { showModal } = useModalActions();
  const router = useRouter();

  return useCallback(
    (ownerUsername: string, tokenDbid: string) => {
      const currentUrl = router.asPath;
      const newUrl = `/${ownerUsername}/token/${tokenDbid}`;
      // set Token Detail Page url without reloading the page. This allows the modal to open quickly, and the user can copy the url
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
      showModal({
        content: (
          <StyledTokenPreviewModal>
            <Suspense fallback={<FullPageLoader />}>
              <LoadableTokenDetailView tokenId={tokenDbid} />
            </Suspense>
          </StyledTokenPreviewModal>
        ),
        isFullPage: true,
        onClose: () => {
          // reset url to previous url without reloading the page
          window.history.replaceState(
            { ...window.history.state, as: currentUrl, url: currentUrl },
            '',
            currentUrl
          );
        },
      });
    },
    [router.asPath, showModal]
  );
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

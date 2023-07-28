import { useRouter } from 'next/router';
import { Suspense, useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import { StyledImageWithLoading } from '~/components/LoadingAsset/ImageWithLoading';
import NftPreview from '~/components/NftPreview/NftPreview';
import { useModalActions } from '~/contexts/modal/ModalContext';
import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { PostNftPreviewFragment$key } from '~/generated/PostNftPreviewFragment.graphql';
import { StyledVideo } from '~/scenes/NftDetailPage/NftDetailVideo';
import { LoadableTokenDetailView } from '~/scenes/TokenDetailPage/TokenDetailView';

type Props = {
  tokenRef: PostNftPreviewFragment$key;
  tokenSize: number;
};

export default function PostNftPreview({ tokenRef, tokenSize }: Props) {
  const token = useFragment(
    graphql`
      fragment PostNftPreviewFragment on Token {
        dbid
        owner {
          username
        }
        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  const { showModal } = useModalActions();
  const router = useRouter();

  const handleClick = useCallback(() => {
    const ownerUsername = token.owner?.username;

    const currentUrl = router.asPath;
    const newUrl = `/${ownerUsername}/token/${token.dbid}`;
    // set Token Detail Page url without reloading the page. This allows the modal to open quickly, and the user can copy the url
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

    showModal({
      content: (
        <StyledTokenPreviewModal>
          <Suspense fallback={<FullPageLoader />}>
            <LoadableTokenDetailView tokenId={token.dbid} />
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
  }, [router.asPath, showModal, token.dbid, token.owner?.username]);

  return (
    <StyledPostNftPreview width={tokenSize} height={tokenSize}>
      <ShimmerProvider>
        <NftPreview
          tokenRef={token}
          previewSize={tokenSize}
          onClick={handleClick}
          shouldLiveRender
        />
      </ShimmerProvider>
    </StyledPostNftPreview>
  );
}

const StyledPostNftPreview = styled.div<{ width: number; height: number }>`
  display: flex;
  max-width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;

  ${StyledImageWithLoading}, ${StyledVideo} {
    max-width: ${({ width }) => width}px;
    max-height: ${({ height }) => height}px;
  }
`;

const StyledTokenPreviewModal = styled.div`
  display: flex;
  justify-content: center;
  height: 100%;
  padding: 80px 0;

  @media only screen and ${breakpoints.desktop} {
    padding: 0;
  }
`;

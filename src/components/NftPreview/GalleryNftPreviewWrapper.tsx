import ShimmerProvider, { useContentState } from 'contexts/shimmer/ShimmerContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { GalleryNftPreviewWrapperFragment$key } from '__generated__/GalleryNftPreviewWrapperFragment.graphql';
import NftPreview from './NftPreview';

type Props = {
  tokenRef: GalleryNftPreviewWrapperFragment$key;
  columns: number;
};

const SINGLE_COLUMN_NFT_WIDTH = 600;
const MOBILE_NFT_WIDTH = 288;

const LAYOUT_DIMENSIONS: Record<number, number> = {
  1: SINGLE_COLUMN_NFT_WIDTH,
  2: 482,
  3: 308,
  4: 221,
  5: 169,
  6: 134,
};

// simple wrapper component so the child can pull state from ShimmerProvider
function NftPreviewWithShimmer(props: Props) {
  return (
    <ShimmerProvider>
      <GalleryNftPreviewWrapper {...props} />
    </ShimmerProvider>
  );
}

// This component determines the appropriate size to render the NftPreview specifically for gallery views. (gallery + collection pages)
function GalleryNftPreviewWrapper({ tokenRef, columns }: Props) {
  const collectionTokenRef = useFragment(
    graphql`
      fragment GalleryNftPreviewWrapperFragment on CollectionToken {
        token @required(action: THROW) {
          dbid
          ...NftPreviewAssetFragment
        }
        collection @required(action: THROW) {
          id
          dbid
        }
        ...NftDetailViewFragment
        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  // width for rendering so that we request the appropriate size image.
  const isMobile = useIsMobileWindowWidth();
  const previewSize = isMobile ? MOBILE_NFT_WIDTH : LAYOUT_DIMENSIONS[columns];

  const { aspectRatioType } = useContentState();

  const nftPreviewMaxWidth = useMemo(() => {
    if (columns > 1) return '100%';

    // this could be a 1-liner but wanted to make it explicit
    if (columns === 1) {
      if (isMobile) {
        return '100%';
      }
      if (aspectRatioType === 'wide') {
        return '100%';
      }
      if (aspectRatioType === 'square' || aspectRatioType === 'tall') {
        return '60%';
      }
    }
  }, [columns, aspectRatioType, isMobile]);

  return (
    <NftPreview
      variant="gallery"
      tokenRef={collectionTokenRef}
      nftPreviewMaxWidth={nftPreviewMaxWidth}
      previewSize={previewSize}
      columns={columns}
    />
  );
}

export default NftPreviewWithShimmer;

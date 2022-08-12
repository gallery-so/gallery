import ShimmerProvider from 'contexts/shimmer/ShimmerContext';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
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

  return <NftPreview tokenRef={collectionTokenRef} previewSize={previewSize} columns={columns} />;
}

export default NftPreviewWithShimmer;

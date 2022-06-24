import ShimmerProvider, { useContentState } from 'contexts/shimmer/ShimmerContext';
import { useCollectionColumns } from 'hooks/useCollectionColumns';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import NftPreview from './NftPreview';

type Props = {
  galleryNftRef: any;
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
function GalleryNftPreviewWrapper({ galleryNftRef }: Props) {
  const collectionTokenRef = useFragment(
    graphql`
      fragment GalleryNftPreviewWrapperFragment on CollectionToken {
        token @required(action: THROW) {
          dbid
          ...getVideoOrImageUrlForNftPreviewFragment
          ...NftPreviewAssetFragment
        }
        collection @required(action: THROW) {
          id
          dbid
          ...useCollectionColumnsFragment
        }
        ...NftDetailViewFragment
        ...NftPreviewFragment
      }
    `,
    galleryNftRef
  );

  const { token, collection } = collectionTokenRef;

  const columns = useCollectionColumns(collection);

  // width for rendering so that we request the apprpriate size image.
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

  const result = getVideoOrImageUrlForNftPreview(token);

  const nftPreviewWidth = useMemo(() => {
    // this allows SVGs to stretch to fit its container, fixing images
    // that appeared tiny.
    //
    // HOWEVER, stretching an svg to 100% when column size = 1 results
    // in the preview label appearing stretched beneath the image, since
    // we cap the max height to 80vh when column = 1; so this is disabled
    // in those cases for now.
    if (columns > 1 && result?.urls?.large?.includes('.svg')) {
      return '100%';
    }
    return 'auto';
  }, [columns, result?.urls?.large]);

  return (
    // <ShimmerProvider>
    <NftPreview
      tokenRef={collectionTokenRef}
      nftPreviewMaxWidth={nftPreviewMaxWidth}
      nftPreviewWidth={nftPreviewWidth}
      previewSize={previewSize}
    />
    // </ShimmerProvider>
  );
}

export default NftPreviewWithShimmer;

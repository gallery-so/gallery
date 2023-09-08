import { graphql, useFragment } from 'react-relay';

import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { GalleryNftPreviewWrapperFragment$key } from '~/generated/GalleryNftPreviewWrapperFragment.graphql';

import CollectionTokenPreview from './CollectionTokenPreview';

type Props = {
  tokenRef: GalleryNftPreviewWrapperFragment$key;
  columns: number;
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
        ...CollectionTokenPreviewFragment
      }
    `,
    tokenRef
  );

  return <CollectionTokenPreview tokenRef={collectionTokenRef} columns={columns} />;
}

export default NftPreviewWithShimmer;

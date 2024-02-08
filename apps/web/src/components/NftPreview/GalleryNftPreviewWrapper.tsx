import { graphql, useFragment } from 'react-relay';

import ShimmerProvider from '~/contexts/shimmer/ShimmerContext';
import { GalleryNftPreviewWrapperFragment$key } from '~/generated/GalleryNftPreviewWrapperFragment.graphql';
import { GalleryNftPreviewWrapperQueryFragment$key } from '~/generated/GalleryNftPreviewWrapperQueryFragment.graphql';

import CollectionTokenPreview from './CollectionTokenPreview';

type Props = {
  queryRef: GalleryNftPreviewWrapperQueryFragment$key;
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
function GalleryNftPreviewWrapper({ queryRef, tokenRef, columns }: Props) {
  const query = useFragment(
    graphql`
      fragment GalleryNftPreviewWrapperQueryFragment on Query {
        ...CollectionTokenPreviewQueryFragment
      }
    `,
    queryRef
  );
  const collectionTokenRef = useFragment(
    graphql`
      fragment GalleryNftPreviewWrapperFragment on CollectionToken {
        ...CollectionTokenPreviewFragment
      }
    `,
    tokenRef
  );

  return (
    <CollectionTokenPreview tokenRef={collectionTokenRef} columns={columns} queryRef={query} />
  );
}

export default NftPreviewWithShimmer;

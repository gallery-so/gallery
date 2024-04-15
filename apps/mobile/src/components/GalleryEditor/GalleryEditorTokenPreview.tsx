import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { graphql, useFragment } from 'react-relay';

import { GalleryEditorTokenPreviewFragment$key } from '~/generated/GalleryEditorTokenPreviewFragment.graphql';

import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { GallerySkeleton } from '../GallerySkeleton';
import { NftPreviewAssetToWrapInBoundary } from '../NftPreview/NftPreviewAsset';

type Props = {
  tokenRef: GalleryEditorTokenPreviewFragment$key;
};

export function GalleryEditorTokenPreview({ tokenRef }: Props) {
  const [assetLoaded, setAssetLoaded] = useState(false);
  const handleAssetLoad = useCallback(() => {
    setAssetLoaded(true);
  }, []);

  const token = useFragment(
    graphql`
      fragment GalleryEditorTokenPreviewFragment on Token {
        ...TokenFailureBoundaryFragment
        ...NftPreviewAssetToWrapInBoundaryFragment
      }
    `,
    tokenRef
  );

  return (
    <TokenFailureBoundary tokenRef={token} variant="tiny">
      <NftPreviewAssetToWrapInBoundary
        tokenRef={token}
        mediaSize="medium"
        resizeMode={ResizeMode.COVER}
        onLoad={handleAssetLoad}
      />
      {!assetLoaded && (
        <View className="absolute inset-0">
          <GallerySkeleton borderRadius={0}>
            <SkeletonPlaceholder.Item width="100%" height="100%" />
          </GallerySkeleton>
        </View>
      )}
    </TokenFailureBoundary>
  );
}

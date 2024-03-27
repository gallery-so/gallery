import { useDraggable, useDroppable } from '@mgcrea/react-native-dnd';
import { ResizeMode } from 'expo-av';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
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
        dbid
        definition {
          name
        }
        ...TokenFailureBoundaryFragment
        ...NftPreviewAssetToWrapInBoundaryFragment
      }
    `,
    tokenRef
  );
  const tokenId = token.dbid;

  const { offset, setNodeRef, activeId, setNodeLayout } = useDraggable({
    data: { id: tokenId, name: token.definition.name },
    id: tokenId,
    disabled: true,
  });

  const { setNodeRef: setDropRef, setNodeLayout: setDropLayout } = useDroppable({
    data: { id: tokenId, name: token.definition.name },
    id: tokenId,
    disabled: true,
  });

  const animatedStyle = useAnimatedStyle(() => {
    const isActive = activeId.value === tokenId;
    const style = {
      opacity: isActive ? 0.9 : 1,
      zIndex: isActive ? 999 : 1,
      transform: [
        {
          translateX: offset.x.value,
        },
        {
          translateY: offset.y.value,
        },
      ],
    };
    return style;
  }, [tokenId]);

  return (
    <Animated.View
      ref={(ref) => {
        setNodeRef(ref);
        setDropRef(ref);
      }}
      onLayout={(event) => {
        setNodeLayout(event);
        setDropLayout(event);
      }}
      style={[animatedStyle]}
    >
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
    </Animated.View>
  );
}

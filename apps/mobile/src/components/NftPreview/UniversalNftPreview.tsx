import { ResizeMode } from 'expo-av';
import { startTransition, useCallback, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Priority } from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { RawNftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { UniversalNftPreviewFragment$key } from '~/generated/UniversalNftPreviewFragment.graphql';
import { UniversalNftPreviewInnerFragment$key } from '~/generated/UniversalNftPreviewInnerFragment.graphql';
import { UniversalNftPreviewWithBoundaryFragment$key } from '~/generated/UniversalNftPreviewWithBoundaryFragment.graphql';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import {
  useGetSinglePreviewImage,
  useGetSinglePreviewImageProps,
} from '~/shared/relay/useGetPreviewImages';
import { noop } from '~/shared/utils/noop';

import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { GallerySkeleton } from '../GallerySkeleton';
import { UniversalNftPreviewContextMenuPopup } from './UniversalNftPreviewContextMenuPopup';

export type ImageState = { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimensions | null };

export type NftPreviewSharedProps = {
  onPress?: () => void;
  onImageStateChange?: (imageState: ImageState) => void;
  priority?: Priority;
  resizeMode: ResizeMode;
};

type UniversalNftPreviewInnerProps = {
  tokenRef: UniversalNftPreviewInnerFragment$key;
  tokenUrl: string | null | undefined;
} & NftPreviewSharedProps;

function UniversalNftPreviewInner({
  tokenRef,
  tokenUrl,
  resizeMode,
  priority,
  onPress,
  onImageStateChange,
}: UniversalNftPreviewInnerProps) {
  const token = useFragment(
    graphql`
      fragment UniversalNftPreviewInnerFragment on Token {
        ...UniversalNftPreviewContextMenuPopupTokenFragment
      }
    `,
    tokenRef
  );

  const prevTokenUrl = useRef(tokenUrl);
  const [imageState, setImageState] = useState<ImageState>({ kind: 'loading' });

  // Since this component gets used in FlashList's a bunch, the state of the image will be stale
  // So here, we track the tokenUrl this instance was previously rendered with
  // and if its stale, we reset the image state to loading
  if (tokenUrl !== prevTokenUrl.current) {
    setImageState({ kind: 'loading' });
    prevTokenUrl.current = tokenUrl;
  }

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('NftPreview', 'tokenUrl missing');
  }

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  const handleLoad = useCallback(
    (dimensions: Dimensions | null) => {
      // This is a low priority update. Interactions are much more important
      startTransition(() => {
        setImageState({ kind: 'loaded', dimensions });
        onImageStateChange?.({ kind: 'loaded', dimensions });
      });
    },
    [onImageStateChange]
  );

  return (
    <UniversalNftPreviewContextMenuPopup
      tokenRef={token}
      fallbackTokenUrl={tokenUrl}
      imageDimensions={imageState.kind === 'loaded' ? imageState.dimensions : null}
    >
      {/* https://github.com/dominicstop/react-native-ios-context-menu/issues/9#issuecomment-1047058781 */}
      <Pressable delayLongPress={100} onPress={handlePress} onLongPress={noop}>
        <View className="relative h-full w-full">
          <RawNftPreviewAsset
            key={tokenUrl}
            tokenUrl={tokenUrl}
            priority={priority}
            resizeMode={resizeMode}
            onLoad={handleLoad}
          />
          {imageState.kind === 'loading' ? (
            <View className="absolute inset-0 bg-white dark:bg-black-900">
              <GallerySkeleton>
                <SkeletonPlaceholder.Item width="100%" height="100%" />
              </GallerySkeleton>
            </View>
          ) : null}
        </View>
      </Pressable>
    </UniversalNftPreviewContextMenuPopup>
  );
}

type UniversalNftPreviewProps = {
  tokenRef: UniversalNftPreviewFragment$key;
  size: useGetSinglePreviewImageProps['size'];
} & NftPreviewSharedProps;

function UniversalNftPreview({ tokenRef, size, ...props }: UniversalNftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment UniversalNftPreviewFragment on Token {
        ...useGetPreviewImagesSingleFragment
        ...UniversalNftPreviewInnerFragment
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size }) ?? '';

  return <UniversalNftPreviewInner {...props} tokenRef={token} tokenUrl={imageUrl} />;
}

type UniversalNftPreviewWithBoundaryProps = {
  tokenRef: UniversalNftPreviewWithBoundaryFragment$key;
  size: useGetSinglePreviewImageProps['size'];
} & NftPreviewSharedProps;

export function UniversalNftPreviewWithBoundary({
  tokenRef,
  onImageStateChange,
  resizeMode,
  priority,
  onPress,
  size,
}: UniversalNftPreviewWithBoundaryProps) {
  const token = useFragment(
    graphql`
      fragment UniversalNftPreviewWithBoundaryFragment on Token {
        ...TokenFailureBoundaryFragment
        ...UniversalNftPreviewFragment
      }
    `,
    tokenRef
  );

  return (
    <TokenFailureBoundary tokenRef={token}>
      <UniversalNftPreview
        tokenRef={token}
        onPress={onPress}
        onImageStateChange={onImageStateChange}
        resizeMode={resizeMode}
        priority={priority}
        size={size}
      />
    </TokenFailureBoundary>
  );
}

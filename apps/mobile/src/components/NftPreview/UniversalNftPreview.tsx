import { ResizeMode } from 'expo-av';
import { startTransition, useCallback, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Priority } from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewErrorFallback } from '~/components/NftPreview/NftPreviewErrorFallback';
import { UniversalNftPreviewTokenFragment$key } from '~/generated/UniversalNftPreviewTokenFragment.graphql';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { GallerySkeleton } from '../GallerySkeleton';
import { UniversalNftPreviewContextMenuPopup } from './UniversalNftPreviewContextMenuPopup';

export type ImageState = { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimensions | null };

type NftPreviewProps = {
  priority?: Priority;

  tokenRef: UniversalNftPreviewTokenFragment$key;
  tokenUrl: string | null | undefined;
  resizeMode: ResizeMode;

  onPress?: () => void;
  onImageStateChange?: (imageState: ImageState) => void;
};

function NftPreviewInner({
  tokenRef,
  tokenUrl,
  resizeMode,
  priority,

  onPress,
  onImageStateChange,
}: NftPreviewProps) {
  const token = useFragment(
    graphql`
      fragment UniversalNftPreviewTokenFragment on Token {
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
      <Pressable delayLongPress={100} onPress={handlePress} onLongPress={() => {}}>
        <View className="relative h-full w-full">
          <NftPreviewAsset
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

export function UniversalNftPreview({
  tokenRef,
  onImageStateChange,
  tokenUrl,
  resizeMode,
  priority,
  onPress,
}: NftPreviewProps) {
  return (
    <ReportingErrorBoundary fallback={<NftPreviewErrorFallback />}>
      <NftPreviewInner
        tokenRef={tokenRef}
        onPress={onPress}
        onImageStateChange={onImageStateChange}
        tokenUrl={tokenUrl}
        resizeMode={resizeMode}
        priority={priority}
      />
    </ReportingErrorBoundary>
  );
}

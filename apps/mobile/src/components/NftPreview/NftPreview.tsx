import { useNavigation } from '@react-navigation/native';
import { ResizeMode } from 'expo-av';
import { startTransition, useCallback, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Priority } from 'react-native-fast-image';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewContextMenuPopup } from '~/components/NftPreview/NftPreviewContextMenuPopup';
import { NftPreviewFragment$key } from '~/generated/NftPreviewFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { GallerySkeleton } from '../GallerySkeleton';

export type ImageState = { kind: 'loading' } | { kind: 'loaded'; dimensions: Dimensions | null };

type NftPreviewProps = {
  priority?: Priority;

  collectionTokenRef: NftPreviewFragment$key;
  tokenUrl: string | null;
  resizeMode: ResizeMode;

  onImageStateChange?: (imageState: ImageState) => void;
};

function NftPreviewInner({
  collectionTokenRef,
  tokenUrl,
  resizeMode,
  priority,
  onImageStateChange,
}: NftPreviewProps) {
  const collectionToken = useFragment(
    graphql`
      fragment NftPreviewFragment on CollectionToken {
        collection {
          dbid
        }
        token @required(action: THROW) {
          dbid
        }
        ...NftPreviewContextMenuPopupFragment
      }
    `,
    collectionTokenRef
  );

  const { token } = collectionToken;

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

  const navigation = useNavigation<MainTabStackNavigatorProp>();
  const handlePress = useCallback(() => {
    if (collectionToken.collection?.dbid) {
      navigation.push('NftDetail', {
        tokenId: token.dbid,
        collectionId: collectionToken.collection.dbid,
      });
    }
  }, [collectionToken.collection?.dbid, navigation, token.dbid]);

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
    <NftPreviewContextMenuPopup
      fallbackTokenUrl={tokenUrl}
      collectionTokenRef={collectionToken}
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
            <View className="absolute inset-0 bg-white dark:bg-black">
              <GallerySkeleton>
                <SkeletonPlaceholder.Item width="100%" height="100%" />
              </GallerySkeleton>
            </View>
          ) : null}
        </View>
      </Pressable>
    </NftPreviewContextMenuPopup>
  );
}

export function NftPreview({
  collectionTokenRef,
  onImageStateChange,
  tokenUrl,
  resizeMode,
  priority,
}: NftPreviewProps) {
  return (
    <ReportingErrorBoundary fallback={null}>
      <NftPreviewInner
        onImageStateChange={onImageStateChange}
        collectionTokenRef={collectionTokenRef}
        tokenUrl={tokenUrl}
        resizeMode={resizeMode}
        priority={priority}
      />
    </ReportingErrorBoundary>
  );
}

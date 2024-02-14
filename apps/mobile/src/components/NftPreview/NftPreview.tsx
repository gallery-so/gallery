import { useNavigation } from '@react-navigation/native';
import { startTransition, useCallback, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { RawNftPreviewAsset } from '~/components/NftPreview/NftPreviewAsset';
import { NftPreviewContextMenuPopup } from '~/components/NftPreview/NftPreviewContextMenuPopup';
import { NftPreviewFragment$key } from '~/generated/NftPreviewFragment.graphql';
import { NftPreviewInnerFragment$key } from '~/generated/NftPreviewInnerFragment.graphql';
import { NftPreviewInnerQueryFragment$key } from '~/generated/NftPreviewInnerQueryFragment.graphql';
import { NftPreviewQueryFragment$key } from '~/generated/NftPreviewQueryFragment.graphql';
import { NftPreviewWithBoundaryFragment$key } from '~/generated/NftPreviewWithBoundaryFragment.graphql';
import { NftPreviewWithBoundaryQueryFragment$key } from '~/generated/NftPreviewWithBoundaryQueryFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import {
  useGetSinglePreviewImage,
  useGetSinglePreviewImageProps,
} from '~/shared/relay/useGetPreviewImages';
import { noop } from '~/shared/utils/noop';

import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { GallerySkeleton } from '../GallerySkeleton';
import { ImageState, NftPreviewSharedProps } from './UniversalNftPreview';

type NftPreviewInnerProps = {
  queryRef: NftPreviewInnerQueryFragment$key;
  collectionTokenRef: NftPreviewInnerFragment$key;
  tokenUrl: string | null | undefined;
} & NftPreviewSharedProps;

function NftPreviewInner({
  queryRef,
  collectionTokenRef,
  tokenUrl,
  resizeMode,
  priority,
  onPress,
  onImageStateChange,
}: NftPreviewInnerProps) {
  const query = useFragment(
    graphql`
      fragment NftPreviewInnerQueryFragment on Query {
        ...NftPreviewContextMenuPopupQueryFragment
      }
    `,
    queryRef
  );
  const collectionToken = useFragment(
    graphql`
      fragment NftPreviewInnerFragment on CollectionToken {
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
  const navigateToNftDetail = useCallback(() => {
    navigation.push('NftDetail', {
      tokenId: token.dbid,
      collectionId: collectionToken.collection?.dbid ?? null,
      cachedPreviewAssetUrl: tokenUrl,
    });
  }, [collectionToken.collection?.dbid, navigation, token.dbid, tokenUrl]);

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    } else {
      navigateToNftDetail();
    }
  }, [navigateToNftDetail, onPress]);

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
      queryRef={query}
      fallbackTokenUrl={tokenUrl}
      collectionTokenRef={collectionToken}
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
    </NftPreviewContextMenuPopup>
  );
}

type NftPreviewProps = {
  queryRef: NftPreviewQueryFragment$key;
  collectionTokenRef: NftPreviewFragment$key;
  size: useGetSinglePreviewImageProps['size'];
} & NftPreviewSharedProps;

function NftPreview({ queryRef, collectionTokenRef, size, ...props }: NftPreviewProps) {
  const query = useFragment(
    graphql`
      fragment NftPreviewQueryFragment on Query {
        ...NftPreviewInnerQueryFragment
      }
    `,
    queryRef
  );
  const collectionToken = useFragment(
    graphql`
      fragment NftPreviewFragment on CollectionToken {
        token {
          ...useGetPreviewImagesSingleFragment
        }
        ...NftPreviewInnerFragment
      }
    `,
    collectionTokenRef
  );

  if (!collectionToken.token) {
    throw new Error('token must exist on collectionToken');
  }

  const imageUrl = useGetSinglePreviewImage({ tokenRef: collectionToken.token, size }) ?? '';

  return (
    <NftPreviewInner
      {...props}
      queryRef={query}
      collectionTokenRef={collectionToken}
      tokenUrl={imageUrl}
    />
  );
}

type NftPreviewWithBoundaryProps = {
  queryRef: NftPreviewWithBoundaryQueryFragment$key;
  collectionTokenRef: NftPreviewWithBoundaryFragment$key;
  size: useGetSinglePreviewImageProps['size'];
} & NftPreviewSharedProps;

export function NftPreviewWithBoundary({
  queryRef,
  collectionTokenRef,
  onImageStateChange,
  resizeMode,
  priority,
  onPress,
  size,
}: NftPreviewWithBoundaryProps) {
  const query = useFragment(
    graphql`
      fragment NftPreviewWithBoundaryQueryFragment on Query {
        ...NftPreviewQueryFragment
      }
    `,
    queryRef
  );
  const collectionToken = useFragment(
    graphql`
      fragment NftPreviewWithBoundaryFragment on CollectionToken {
        token {
          ...TokenFailureBoundaryFragment
        }
        ...NftPreviewFragment
      }
    `,
    collectionTokenRef
  );

  if (!collectionToken.token) {
    throw new Error('token must exist on collectionToken');
  }

  return (
    <TokenFailureBoundary tokenRef={collectionToken.token}>
      <NftPreview
        queryRef={query}
        collectionTokenRef={collectionToken}
        onPress={onPress}
        onImageStateChange={onImageStateChange}
        resizeMode={resizeMode}
        priority={priority}
        size={size}
      />
    </TokenFailureBoundary>
  );
}

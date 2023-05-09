import { ResizeMode } from 'expo-av';
import { useCallback, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ImageState, NftPreview } from '~/components/NftPreview/NftPreview';
import { useGalleryTokenDimensionCache } from '~/contexts/GalleryTokenDimensionCacheContext';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { fitDimensionsToContainerContain } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

type GalleryTokenPreviewProps = {
  tokenRef: GalleryTokenPreviewFragment$key;
  containerWidth: number;
};

export function GalleryTokenPreview({ tokenRef, containerWidth }: GalleryTokenPreviewProps) {
  const token = useFragment(
    graphql`
      fragment GalleryTokenPreviewFragment on CollectionToken {
        __typename

        token @required(action: THROW) {
          ...getVideoOrImageUrlForNftPreviewFragment
        }

        ...NftPreviewFragment
      }
    `,
    tokenRef
  );

  const tokenUrl = useMemo(() => {
    const tokenUrls = getVideoOrImageUrlForNftPreview({ tokenRef: token.token });
    if (containerWidth < 200) {
      return tokenUrls?.urls.medium;
    } else if (containerWidth < 400) {
      return tokenUrls?.urls.large;
    }
  }, [containerWidth, token.token]);

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('GalleryTokenPreview', 'Missing token url');
  }

  const { cache, addDimensionsToCache } = useGalleryTokenDimensionCache();

  const screenDimensions = useWindowDimensions();
  const handleImageStateChange = useCallback(
    (imageState: ImageState) => {
      if (imageState.kind === 'loaded' && imageState.dimensions) {
        addDimensionsToCache(tokenUrl, imageState.dimensions);
      }
    },
    [addDimensionsToCache, tokenUrl]
  );

  const resultDimensions = useMemo(() => {
    const cachedDimensions = cache.get(tokenUrl) ?? null;

    if (cachedDimensions) {
      const result = fitDimensionsToContainerContain({
        container: { width: containerWidth, height: screenDimensions.height / 2 },
        source: cachedDimensions,
      });

      return result;
    }

    return null;
  }, [cache, containerWidth, screenDimensions.height, tokenUrl]);

  return (
    <View
      className="flex-grow"
      style={resultDimensions ? resultDimensions : { width: containerWidth, aspectRatio: 1 }}
    >
      <NftPreview
        onImageStateChange={handleImageStateChange}
        collectionTokenRef={token}
        tokenUrl={tokenUrl}
        resizeMode={ResizeMode.CONTAIN}
      />
    </View>
  );
}

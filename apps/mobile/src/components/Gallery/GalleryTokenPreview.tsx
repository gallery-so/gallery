import { ResizeMode } from 'expo-av';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ImageState, NftPreview } from '~/components/NftPreview/NftPreview';
import { useGalleryTokenDimensionCache } from '~/contexts/GalleryTokenDimensionCacheContext';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { fitDimensionsToContainerContain } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
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
      return tokenUrls?.urls.small;
    } else if (containerWidth < 400) {
      return tokenUrls?.urls.large;
    }
  }, [containerWidth, token.token]);

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('GalleryTokenPreview', 'Missing token url');
  }

  const { cache, addDimensionsToCache } = useGalleryTokenDimensionCache();

  const [imageDimensions, setImageDimensions] = useState<Dimensions | null>(null);

  const screenDimensions = useWindowDimensions();
  const handleImageStateChange = useCallback((imageState: ImageState) => {
    if (imageState.kind === 'loaded') {
      setImageDimensions(imageState.dimensions);
    }
  }, []);

  const resultDimensions = useMemo(() => {
    const cachedDimensions = cache.get(tokenUrl) ?? null;

    if (cachedDimensions) {
      return cachedDimensions;
    } else if (imageDimensions) {
      const result = fitDimensionsToContainerContain({
        container: { width: containerWidth, height: screenDimensions.height / 2 },
        source: imageDimensions,
      });

      return result;
    }
  }, [cache, containerWidth, imageDimensions, screenDimensions.height, tokenUrl]);

  useEffect(() => {
    if (resultDimensions) {
      addDimensionsToCache(tokenUrl, resultDimensions);
    }
  }, [addDimensionsToCache, resultDimensions, tokenUrl]);

  return (
    <View
      className="flex-grow"
      style={resultDimensions ? resultDimensions : { height: 200, width: '100%' }}
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

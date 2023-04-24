import { ResizeMode } from 'expo-av';
import { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ImageState, NftPreview } from '~/components/NftPreview/NftPreview';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { fitDimensionsToContainerContain } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { CouldNotRenderNftError } from '~/shared/errors/CouldNotRenderNftError';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

type GalleryTokenPreviewProps = {
  tokenRef: GalleryTokenPreviewFragment$key;
};

// We use this cache to avoid re-calculating the dimensions for the same image
// as the user is scrolling through the gallery.
// Without this, when the user scrolls fast, they'll have some height jitter.
//
// Generally speaking, you shouldn't ever keep this state outside of React.
// But the real goal here is to avoid re-renders at all.
// I'm not worried about transition tearing here.
const resultDimensionCache = new Map<string, Dimensions>();

export function GalleryTokenPreview({ tokenRef }: GalleryTokenPreviewProps) {
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

  const tokenUrls = getVideoOrImageUrlForNftPreview({ tokenRef: token.token });
  const tokenUrl = tokenUrls?.urls.medium;

  if (!tokenUrl) {
    throw new CouldNotRenderNftError('GalleryTokenPreview', 'Missing token url');
  }

  const [containerDimensions, setContainerDimensions] = useState<Dimensions | null>(null);
  const [imageDimensions, setImageDimensions] = useState<Dimensions | null>(null);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerDimensions((previous) => {
      if (previous) {
        return previous;
      }

      return {
        width: event.nativeEvent.layout.width,
        height: event.nativeEvent.layout.height,
      };
    });
  }, []);

  const handleImageStateChange = useCallback((imageState: ImageState) => {
    if (imageState.kind === 'loaded') {
      setImageDimensions(imageState.dimensions);
    }
  }, []);

  const resultingDimensions = useMemo((): Dimensions | null => {
    const cachedDimensions = resultDimensionCache.get(tokenUrl);

    if (cachedDimensions) {
      return cachedDimensions;
    } else if (containerDimensions && imageDimensions) {
      const result = fitDimensionsToContainerContain({
        container: containerDimensions,
        source: imageDimensions,
      });

      resultDimensionCache.set(tokenUrl, result);

      return result;
    } else if (containerDimensions) {
      return containerDimensions;
    }

    return null;
  }, [containerDimensions, imageDimensions, tokenUrl]);

  const screenDimensions = useWindowDimensions();

  return (
    <View
      className="flex-grow"
      style={
        resultingDimensions
          ? resultingDimensions
          : { height: screenDimensions.height / 2, width: '100%' }
      }
      onLayout={handleLayout}
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

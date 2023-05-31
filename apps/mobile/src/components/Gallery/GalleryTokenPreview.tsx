import { ResizeMode } from 'expo-av';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { ImageState, NftPreview } from '~/components/NftPreview/NftPreview';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { fitDimensionsToContainerContain } from '~/screens/NftDetailScreen/NftDetailAsset/fitDimensionToContainer';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
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
          media {
            ... on Media {
              dimensions {
                width
                height
              }
            }
          }
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
    } else {
      return tokenUrls?.urls.large;
    }
  }, [containerWidth, token.token]);

  // We need this as a fallback in case the backend is missing dimensions
  const [measuredDimensions, setMeasuredDimensions] = useState<Dimensions | null>(null);

  const screenDimensions = useWindowDimensions();
  const handleImageStateChange = useCallback(
    (imageState: ImageState) => {
      if (imageState.kind === 'loaded' && imageState.dimensions && tokenUrl) {
        setMeasuredDimensions(imageState.dimensions);
      }
    },
    [tokenUrl]
  );

  const resultDimensions = useMemo(() => {
    if (!tokenUrl) {
      return null;
    }

    const serverSourcedDimensions = token.token.media?.dimensions;
    if (serverSourcedDimensions?.width && serverSourcedDimensions.height) {
      return fitDimensionsToContainerContain({
        container: { width: containerWidth, height: screenDimensions.height / 2 },
        source: {
          width: serverSourcedDimensions.width,
          height: serverSourcedDimensions.height,
        },
      });
    }

    if (measuredDimensions) {
      return fitDimensionsToContainerContain({
        container: { width: containerWidth, height: screenDimensions.height / 2 },
        source: measuredDimensions,
      });
    }

    return null;
  }, [
    containerWidth,
    measuredDimensions,
    screenDimensions.height,
    token.token.media?.dimensions,
    tokenUrl,
  ]);

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

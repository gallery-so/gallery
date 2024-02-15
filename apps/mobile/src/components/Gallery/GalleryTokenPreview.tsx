import { ResizeMode } from 'expo-av';
import { useCallback, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftPreviewWithBoundary } from '~/components/NftPreview/NftPreview';
import { GalleryTokenPreviewFragment$key } from '~/generated/GalleryTokenPreviewFragment.graphql';
import { GalleryTokenPreviewQueryFragment$key } from '~/generated/GalleryTokenPreviewQueryFragment.graphql';
import { Dimensions } from '~/screens/NftDetailScreen/NftDetailAsset/types';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { fitDimensionsToContainerContain } from '~/shared/utils/fitDimensionsToContainer';

import { ImageState } from '../NftPreview/UniversalNftPreview';

type GalleryTokenPreviewProps = {
  queryRef: GalleryTokenPreviewQueryFragment$key;
  tokenRef: GalleryTokenPreviewFragment$key;
  containerWidth: number;
};

export function GalleryTokenPreview({
  queryRef,
  tokenRef,
  containerWidth,
}: GalleryTokenPreviewProps) {
  const query = useFragment(
    graphql`
      fragment GalleryTokenPreviewQueryFragment on Query {
        ...NftPreviewWithBoundaryQueryFragment
      }
    `,
    queryRef
  );
  const token = useFragment(
    graphql`
      fragment GalleryTokenPreviewFragment on CollectionToken {
        __typename

        token @required(action: THROW) {
          definition {
            media {
              ... on Media {
                dimensions {
                  width
                  height
                }
              }
            }
          }
          ...getPreviewImageUrlsInlineDangerouslyFragment
        }

        ...NftPreviewWithBoundaryFragment
      }
    `,
    tokenRef
  );

  const tokenUrl = useMemo(() => {
    // TODO: not entirely clear what calculating `tokenUrl` accomplishes on this level.
    // but also don't want to remove it because that might break everything
    const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token.token });
    if (result.type !== 'valid') {
      return '';
    }

    if (containerWidth < 200) {
      return result.urls.medium;
    } else {
      return result.urls.large;
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

    const serverSourcedDimensions = token.token.definition?.media?.dimensions;
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
  }, [containerWidth, measuredDimensions, screenDimensions.height, token, tokenUrl]);

  return (
    <View
      className="flex-grow"
      style={resultDimensions ? resultDimensions : { width: containerWidth, aspectRatio: 1 }}
    >
      <NftPreviewWithBoundary
        queryRef={query}
        onImageStateChange={handleImageStateChange}
        collectionTokenRef={token}
        resizeMode={ResizeMode.CONTAIN}
        size={containerWidth < 200 ? 'medium' : 'large'}
      />
    </View>
  );
}

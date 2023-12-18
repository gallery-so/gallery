import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftPreviewAssetFragment$key } from '~/generated/NftPreviewAssetFragment.graphql';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import { fitDimensionsToContainerContain } from '~/shared/utils/fitDimensionsToContainer';


const DESKTOP_TOKEN_SIZE = 600;

type Props = {
  tokenRef: NftPreviewAssetFragment$key;
  onLoad: ContentIsLoadedEvent;
};

function NftPreviewAsset({ tokenRef, onLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment NftPreviewAssetFragment on Token {
        ...useGetPreviewImagesSingleFragment
        dbid
        name

        media @required(action: THROW) {
          ... on Media {
            dimensions {
              width
              height
            }
          }
        }
      }
    `,
    tokenRef
  );

  const resultDimensions = useMemo(() => {
    const serverSourcedDimensions = token.media?.dimensions;
    if (serverSourcedDimensions?.width && serverSourcedDimensions.height) {
      return fitDimensionsToContainerContain({
        container: { width: DESKTOP_TOKEN_SIZE, height: DESKTOP_TOKEN_SIZE },
        source: {
          width: serverSourcedDimensions.width,
          height: serverSourcedDimensions.height,
        },
      });
    }

    return {
      height: DESKTOP_TOKEN_SIZE,
      width: DESKTOP_TOKEN_SIZE,
    };
  }, [token.media?.dimensions]);

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';
  const { cacheLoadedImageUrls } = useNftPreviewFallbackState();

  const handleAssetLoad = useCallback(() => {
    if (token.dbid && imageUrl) {
      cacheLoadedImageUrls(token.dbid, 'preview', imageUrl, resultDimensions);
    }
    onLoad();
  }, [token.dbid, imageUrl, cacheLoadedImageUrls, onLoad, resultDimensions]);

  return (
    <ImageWithLoading
      onLoad={handleAssetLoad}
      src={imageUrl}
      heightType="maxHeightScreen"
      alt={token.name ?? ''}
    />
  );
}

export default NftPreviewAsset;

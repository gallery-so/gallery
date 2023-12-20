import { useCallback, useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftPreviewAssetFragment$key } from '~/generated/NftPreviewAssetFragment.graphql';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';
import {
  DESKTOP_TOKEN_DETAIL_VIEW_SIZE,
  MOBILE_TOKEN_DETAIL_VIEW_SIZE,
  fitDimensionsToContainerContain,
} from '~/shared/utils/fitDimensionsToContainer';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

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

  const isMobileOrMobileLarge = useIsMobileOrMobileLargeWindowWidth();

  const resultDimensions = useMemo(() => {
    const TOKEN_SIZE = isMobileOrMobileLarge
      ? MOBILE_TOKEN_DETAIL_VIEW_SIZE
      : DESKTOP_TOKEN_DETAIL_VIEW_SIZE;
    const serverSourcedDimensions = token.media?.dimensions;

    if (serverSourcedDimensions?.width && serverSourcedDimensions.height) {
      return fitDimensionsToContainerContain({
        container: { width: TOKEN_SIZE, height: TOKEN_SIZE },
        source: {
          width: serverSourcedDimensions.width,
          height: serverSourcedDimensions.height,
        },
      });
    }

    return {
      height: TOKEN_SIZE,
      width: TOKEN_SIZE,
    };
  }, [token.media?.dimensions, isMobileOrMobileLarge]);

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

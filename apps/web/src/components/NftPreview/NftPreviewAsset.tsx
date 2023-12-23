import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { NftPreviewAssetFragment$key } from '~/generated/NftPreviewAssetFragment.graphql';
import { useContainedDimensionsForToken } from '~/hooks/useContainedDimensionsForToken';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

type Props = {
  tokenRef: NftPreviewAssetFragment$key;
  onLoad: ContentIsLoadedEvent;
};

function NftPreviewAsset({ tokenRef, onLoad }: Props) {
  const token = useFragment(
    graphql`
      fragment NftPreviewAssetFragment on Token {
        ...useGetPreviewImagesSingleFragment
        media @required(action: THROW) {
          ... on Media {
            ...useContainedDimensionsForTokenFragment
          }
        }
        dbid
        name
      }
    `,
    tokenRef
  );

  const resultDimensions = useContainedDimensionsForToken({ mediaRef: token.media });
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

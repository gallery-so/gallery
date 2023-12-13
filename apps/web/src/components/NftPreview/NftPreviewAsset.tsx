import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useCallback } from 'react';

import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
import { useNftPreviewFallbackState } from '~/contexts/nftPreviewFallback/NftPreviewFallbackContext';
import { NftPreviewAssetFragment$key } from '~/generated/NftPreviewAssetFragment.graphql';
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
        dbid
        name
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';
  const { cacheLoadedImageUrls } = useNftPreviewFallbackState();

  const handleAssetLoad = useCallback(() => {
    if (token.dbid && imageUrl) {
      cacheLoadedImageUrls(token.dbid, 'preview', imageUrl);
      console.log('preview image url is cached');

      console.log(imageUrl);
    }
    onLoad();
  }, [token.dbid, imageUrl, cacheLoadedImageUrls, onLoad]);

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

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import ImageWithLoading from '~/components/LoadingAsset/ImageWithLoading';
import { ContentIsLoadedEvent } from '~/contexts/shimmer/ShimmerContext';
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
        name
      }
    `,
    tokenRef
  );

  const imageUrl = useGetSinglePreviewImage({ tokenRef: token, size: 'large' }) ?? '';

  return (
    <ImageWithLoading
      onLoad={onLoad}
      src={imageUrl}
      heightType="maxHeightScreen"
      alt={token.name ?? ''}
    />
  );
}

export default NftPreviewAsset;

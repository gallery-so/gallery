import { RouteProp, useRoute } from '@react-navigation/native';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { PostTokenPreviewQuery } from '~/generated/PostTokenPreviewQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';
import { NftDetailAsset } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAsset';
import { NftDetailAssetCacheSwapper } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';
import { useGetSinglePreviewImage } from '~/shared/relay/useGetPreviewImages';

import { TokenFailureBoundary } from '../Boundaries/TokenFailureBoundary/TokenFailureBoundary';
import { Typography } from '../Typography';

export function PostTokenPreview() {
  const route = useRoute<RouteProp<RootStackNavigatorParamList, 'PostComposer'>>();

  const query = useLazyLoadQuery<PostTokenPreviewQuery>(
    graphql`
      query PostTokenPreviewQuery($tokenId: DBID!) {
        tokenById(id: $tokenId) {
          ... on Token {
            __typename
            name
            tokenId

            contract {
              name
            }

            ...NftDetailAssetFragment
            ...useGetPreviewImagesSingleFragment
            ...TokenFailureBoundaryFragment
          }
        }
      }
    `,
    {
      tokenId: route.params.tokenId,
    }
  );

  const token = query.tokenById;

  if (token?.__typename !== 'Token') {
    throw new Error("We couldn't find that token. Something went wrong and we're looking into it.");
  }

  const imageUrl = useGetSinglePreviewImage({
    tokenRef: token,
    preferStillFrameFromGif: true,
    size: 'large',
    // we're simply using the URL for warming the cache;
    // no need to throw an error if image is invalid
    shouldThrow: false,
  });

  return (
    <View className="flex flex-col space-y-2">
      <View className="bg-offWhite dark:bg-black-800">
        <View className="w-full">
          <TokenFailureBoundary tokenRef={token} variant="large">
            <NftDetailAssetCacheSwapper cachedPreviewAssetUrl={imageUrl ?? ''}>
              <NftDetailAsset tokenRef={token} />
            </NftDetailAssetCacheSwapper>
          </TokenFailureBoundary>
        </View>
      </View>

      <View className="flex flex-col space-y-2">
        <Typography
          className="text-lg text-black-800 dark:text-offWhite"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {token.name}
        </Typography>
        <Typography
          className="text-lg text-metal leading-[20px]"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {token.contract?.name}
        </Typography>
      </View>
    </View>
  );
}

import { RouteProp, useRoute } from '@react-navigation/native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { XMarkIcon } from 'src/icons/XMarkIcon';

import { PostTokenPreviewQuery } from '~/generated/PostTokenPreviewQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';
import { NftDetailAsset } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAsset';
import { NftDetailAssetCacheSwapper } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { IconContainer } from '../IconContainer';
import { NftPreviewErrorFallback } from '../NftPreview/NftPreviewErrorFallback';
import { Typography } from '../Typography';

export function PostTokenPreview() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Post'>>();

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
            ...getVideoOrImageUrlForNftPreviewFragment
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

  const tokenUrl = useMemo(() => {
    const tokenUrls = getVideoOrImageUrlForNftPreview({ tokenRef: token });
    return tokenUrls?.urls.large;
  }, [token]);

  return (
    <View className="flex flex-col space-y-2">
      <View className="bg-offWhite">
        <ReportingErrorBoundary
          fallback={
            <View className="w-full aspect-square">
              <NftPreviewErrorFallback />
            </View>
          }
        >
          <NftDetailAssetCacheSwapper cachedPreviewAssetUrl={tokenUrl ?? ''}>
            <NftDetailAsset tokenRef={token} />
          </NftDetailAssetCacheSwapper>
        </ReportingErrorBoundary>

        <IconContainer
          eventElementId={null}
          eventName={null}
          icon={<XMarkIcon height={8} />}
          onPress={() => {}}
          size="xs"
          border
          color="white"
          className="absolute -top-2 -right-2"
        />
      </View>

      <View className="flex flex-col">
        <Typography
          className="text-lg text-black-800 leading-none"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {token.name}
        </Typography>
        <Typography
          className="text-lg text-metal leading-none"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {token.contract?.name}
        </Typography>
      </View>
    </View>
  );
}

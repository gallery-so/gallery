import { RouteProp, useRoute } from '@react-navigation/native';
import { useMemo } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { PostTokenPreviewQuery } from '~/generated/PostTokenPreviewQuery.graphql';
import { RootStackNavigatorParamList } from '~/navigation/types';
import { NftDetailAsset } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAsset';
import { NftDetailAssetCacheSwapper } from '~/screens/NftDetailScreen/NftDetailAsset/NftDetailAssetCacheSwapper';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

import { GalleryBottomSheetModalType } from '../GalleryBottomSheet/GalleryBottomSheetModal';
import { NftPreviewErrorFallback } from '../NftPreview/NftPreviewErrorFallback';
import { Typography } from '../Typography';

type Props = {
  bottomSheetRef: React.RefObject<GalleryBottomSheetModalType>;
};

export function PostTokenPreview({ bottomSheetRef }: Props) {
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
      <View className="bg-offWhite dark:bg-black-800">
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
      </View>

      <View className="flex flex-col space-y-2">
        <Typography
          className="text-lg text-black-800 dark:text-offWhite leading-[18px]"
          font={{ family: 'ABCDiatype', weight: 'Bold' }}
        >
          {token.name}
        </Typography>
        <Typography
          className="text-lg text-metal leading-[18px]"
          font={{ family: 'ABCDiatype', weight: 'Regular' }}
        >
          {token.contract?.name}
        </Typography>
      </View>
    </View>
  );
}

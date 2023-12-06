import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { POSTS_PER_PAGE } from 'src/constants/feed';
import { useRefreshHandle } from 'src/hooks/useRefreshHandle';

import { CommunityView } from '~/components/Community/CommunityView';
import { CommunityViewFallback } from '~/components/Community/CommunityViewFallback';
import { GalleryRefreshControl } from '~/components/GalleryRefreshControl';
import { CommunityScreenInitializeQuery } from '~/generated/CommunityScreenInitializeQuery.graphql';
import { CommunityScreenQuery } from '~/generated/CommunityScreenQuery.graphql';
import { Chain } from '~/generated/CommunityScreenQuery.graphql';
import { CommunityScreenRefetchableFragment$key } from '~/generated/CommunityScreenRefetchableFragment.graphql';
import { CommunityScreenRefetchableFragmentQuery } from '~/generated/CommunityScreenRefetchableFragmentQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import { SharePostBottomSheet } from '../PostScreen/SharePostBottomSheet';

type CommunityScreenInnerProps = {
  chain: Chain;
  contractAddress: string;
};

function CommunityScreenInner({ chain, contractAddress }: CommunityScreenInnerProps) {
  const communityQuery = useLazyLoadQuery<CommunityScreenInitializeQuery>(
    graphql`
      query CommunityScreenInitializeQuery($communityAddress: ChainAddressInput!) {
        community: communityByAddress(communityAddress: $communityAddress)
          @required(action: THROW) {
          ... on Community {
            dbid
          }
        }
      }
    `,
    {
      communityAddress: {
        address: contractAddress,
        chain: chain,
      },
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  const wrapperQuery = useLazyLoadQuery<CommunityScreenQuery>(
    graphql`
      query CommunityScreenQuery(
        $communityAddress: ChainAddressInput!
        $listOwnersFirst: Int!
        $listOwnersAfter: String
        $onlyGalleryUsers: Boolean
        $postLast: Int!
        $postBefore: String
        $communityID: DBID!
      ) {
        ...CommunityScreenRefetchableFragment
      }
    `,
    {
      communityAddress: {
        address: contractAddress,
        chain: chain,
      },
      listOwnersFirst: 200,
      onlyGalleryUsers: true,
      postLast: POSTS_PER_PAGE,
      communityID: communityQuery.community.dbid ?? '',
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  const [query, refetch] = useRefetchableFragment<
    CommunityScreenRefetchableFragmentQuery,
    CommunityScreenRefetchableFragment$key
  >(
    graphql`
      fragment CommunityScreenRefetchableFragment on Query
      @refetchable(queryName: "CommunityScreenRefetchableFragmentQuery") {
        ...CommunityViewFragment
      }
    `,
    wrapperQuery
  );

  const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flex: 1 }}
        refreshControl={
          <GalleryRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        <CommunityView queryRef={query} />
      </ScrollView>
    </View>
  );
}

export function CommunityScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Community'>>();
  const { chain, contractAddress, postId, creatorName } = route.params;

  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <Suspense fallback={<CommunityViewFallback />}>
        <CommunityScreenInner contractAddress={contractAddress} chain={chain as Chain} />
      </Suspense>
      {postId && (
        <Suspense fallback={null}>
          <SharePostBottomSheet postId={postId} creatorName={creatorName} />
        </Suspense>
      )}
    </View>
  );
}

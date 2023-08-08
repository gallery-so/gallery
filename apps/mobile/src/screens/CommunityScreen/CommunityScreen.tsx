import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { CommunityView } from '~/components/Community/CommunityView';
import { CommunityViewFallback } from '~/components/Community/CommunityViewFallback';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { CommunityScreenInitializeQuery } from '~/generated/CommunityScreenInitializeQuery.graphql';
import { CommunityScreenQuery } from '~/generated/CommunityScreenQuery.graphql';
import { Chain } from '~/generated/CommunityScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

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

  const query = useLazyLoadQuery<CommunityScreenQuery>(
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
        ...CommunityViewFragment
      }
    `,
    {
      communityAddress: {
        address: contractAddress,
        chain: chain,
      },
      listOwnersFirst: 200,
      onlyGalleryUsers: true,
      postLast: 24,
      communityID: communityQuery.community.dbid ?? '',
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  const { top } = useSafeAreaPadding();

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <CommunityView queryRef={query} />
    </View>
  );
}

export function CommunityScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Community'>>();
  const { chain, contractAddress } = route.params;

  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <Suspense fallback={<CommunityViewFallback />}>
        <CommunityScreenInner contractAddress={contractAddress} chain={chain as Chain} />
      </Suspense>
    </View>
  );
}

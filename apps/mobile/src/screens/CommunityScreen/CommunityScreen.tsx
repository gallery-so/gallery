import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { CommunityView } from '~/components/Community/CommunityView';
import { CommunityViewFallback } from '~/components/Community/CommunityViewFallback';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { CommunityScreenQuery } from '~/generated/CommunityScreenQuery.graphql';
import { Chain } from '~/generated/CommunityScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

type CommunityScreenInnerProps = {
  chain: Chain;
  contractAddress: string;
};

function CommunityScreenInner({ chain, contractAddress }: CommunityScreenInnerProps) {
  const query = useLazyLoadQuery<CommunityScreenQuery>(
    graphql`
      query CommunityScreenQuery(
        $communityAddress: ChainAddressInput!
        $listOwnersFirst: Int!
        $listOwnersAfter: String
        $onlyGalleryUsers: Boolean
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
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  const { top } = useSafeAreaPadding();

  return (
    <View style={{ flex: 1, paddingTop: top }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flex: 1 }}>
        <CommunityView queryRef={query} />
      </ScrollView>
    </View>
  );
}

export function CommunityScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Community'>>();
  const { chain, contractAddress } = route.params;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Suspense fallback={<CommunityViewFallback />}>
        <CommunityScreenInner contractAddress={contractAddress} chain={chain as Chain} />
      </Suspense>
    </View>
  );
}

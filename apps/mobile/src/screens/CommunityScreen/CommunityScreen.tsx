import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { CommunityView } from '~/components/Community/CommunityView';
import { ProfileViewFallback } from '~/components/ProfileView/ProfileViewFallback';
import { useSafeAreaPadding } from '~/components/SafeAreaViewWithPadding';
import { CommunityScreenQuery } from '~/generated/CommunityScreenQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

type CommunityScreenInnerProps = {
  contractAddress: string;
};

function CommunityScreenInner({ contractAddress }: CommunityScreenInnerProps) {
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
        chain: 'Ethereum',
      },
      //   listOwnersFirst: LIST_ITEM_PER_PAGE,
      listOwnersFirst: 200,
      onlyGalleryUsers: true,
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  const { top } = useSafeAreaPadding();

  console.log('contractAddress', contractAddress);
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
  const contractAddress = route.params.contractAddress;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Suspense fallback={<ProfileViewFallback />}>
        {/* <CommunityScreenInner contractAddress={contractAddress} /> */}
        <CommunityScreenInner contractAddress={'0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85'} />
      </Suspense>
    </View>
  );
}

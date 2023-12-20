import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { POSTS_PER_PAGE } from 'src/constants/feed';

import { CommunityView } from '~/components/Community/CommunityView';
import { CommunityViewFallback } from '~/components/Community/CommunityViewFallback';
import { CommunityScreenArtBlocksCommunityQuery } from '~/generated/CommunityScreenArtBlocksCommunityQuery.graphql';
import { CommunityScreenContractCommunityQuery } from '~/generated/CommunityScreenContractCommunityQuery.graphql';
import { Chain } from '~/generated/CommunityScreenContractCommunityQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

import { SharePostBottomSheet } from '../PostScreen/SharePostBottomSheet';

/**
 * NOTE: this was the OG community query prior to when we had separate queries for contracts and art blocks.
 *       some things that may regress in the meantime:
 *       1) checking whether the user is a member of the community on component load (communityID)
 *       2) pull-to-refresh, because the `query` returned from the refetchableFragment needed to be
 *          passed into the CommunityView, but the CommunityView should be agnostic to the community type
 */
// type CommunityScreenInnerProps = {
//   chain: Chain;
//   contractAddress: string;
// };
// function CommunityScreenInner({ chain, contractAddress }: CommunityScreenInnerProps) {
//   const communityQuery = useLazyLoadQuery<CommunityScreenInitializeQuery>(
//     graphql`
//       query CommunityScreenInitializeQuery($communityAddress: ChainAddressInput!) {
//         community: communityByAddress(communityAddress: $communityAddress)
//           @required(action: THROW) {
//           ... on Community {
//             dbid
//           }
//         }
//       }
//     `,
//     {
//       communityAddress: {
//         address: contractAddress,
//         chain: chain,
//       },
//     },
//     { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
//   );

//   const wrapperQuery = useLazyLoadQuery<CommunityScreenQuery>(
//     graphql`
//       query CommunityScreenQuery(
//         $communityAddress: ChainAddressInput!
//         $listOwnersFirst: Int!
//         $listOwnersAfter: String
//         $postLast: Int!
//         $postBefore: String
//         $communityID: DBID!
//       ) {
//         ...CommunityScreenRefetchableFragment
//       }
//     `,
//     {
//       communityAddress: {
//         address: contractAddress,
//         chain: chain,
//       },
//       listOwnersFirst: 200,
//       postLast: POSTS_PER_PAGE,
//       communityID: communityQuery.community.dbid ?? '',
//     },
//     { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
//   );

//   const [query, refetch] = useRefetchableFragment<
//     CommunityScreenRefetchableFragmentQuery,
//     CommunityScreenRefetchableFragment$key
//   >(
//     graphql`
//       fragment CommunityScreenRefetchableFragment on Query
//       @refetchable(queryName: "CommunityScreenRefetchableFragmentQuery") {
//         ...CommunityViewFragment
//       }
//     `,
//     wrapperQuery
//   );

//   const { isRefreshing, handleRefresh } = useRefreshHandle(refetch);

//   return (
//     <View style={{ flex: 1 }}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={{ flex: 1 }}
//         refreshControl={
//           <GalleryRefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
//         }
//       >
//         <CommunityView queryRef={query} />
//       </ScrollView>
//     </View>
//   );
// }

type ContractCommunityViewProps = {
  contractAddress: string;
  chain: Chain;
};

function ContractCommunityView({ contractAddress, chain }: ContractCommunityViewProps) {
  const initializerQuery = useLazyLoadQuery<CommunityScreenContractCommunityQuery>(
    graphql`
      query CommunityScreenContractCommunityQuery(
        $contractCommunityInput: ContractCommunityKeyInput!
        $listOwnersFirst: Int!
        $listOwnersAfter: String
        $postLast: Int!
        $postBefore: String
        $communityID: DBID!
      ) {
        community: contractCommunityByKey(key: $contractCommunityInput) @required(action: THROW) {
          ... on Community {
            ...CommunityViewCommunityFragment
          }
        }
        ...CommunityViewFragment
      }
    `,
    {
      contractCommunityInput: {
        contract: {
          address: contractAddress,
          chain,
        },
      },
      listOwnersFirst: 200,
      postLast: POSTS_PER_PAGE,
      // TODO: this should be fixed, check comment at top of file
      communityID: '',
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flex: 1 }}>
        <CommunityView queryRef={initializerQuery} communityRef={initializerQuery.community} />
      </ScrollView>
    </View>
  );
}

type ArtBlocksCommunityViewProps = {
  projectId: string;
  contractAddress: string;
  chain: Chain;
};

function ArtBlocksCommunityView({
  projectId,
  contractAddress,
  chain,
}: ArtBlocksCommunityViewProps) {
  const initializerQuery = useLazyLoadQuery<CommunityScreenArtBlocksCommunityQuery>(
    graphql`
      query CommunityScreenArtBlocksCommunityQuery(
        $artBlocksCommunityInput: ArtBlocksCommunityKeyInput!
        $listOwnersFirst: Int!
        $listOwnersAfter: String
        $postLast: Int!
        $postBefore: String
        $communityID: DBID!
      ) {
        community: artBlocksCommunityByKey(key: $artBlocksCommunityInput) @required(action: THROW) {
          ... on Community {
            ...CommunityViewCommunityFragment
          }
        }
        ...CommunityViewFragment
      }
    `,
    {
      artBlocksCommunityInput: {
        contract: {
          address: contractAddress,
          chain,
        },
        projectID: projectId,
      },
      listOwnersFirst: 200,
      postLast: POSTS_PER_PAGE,
      // TODO: this should be fixed, check comment at top of file
      communityID: '',
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flex: 1 }}>
        <CommunityView queryRef={initializerQuery} communityRef={initializerQuery.community} />
      </ScrollView>
    </View>
  );
}

export function CommunityScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Community'>>();
  const { subtype, chain, contractAddress, projectId, postId, creatorName } = route.params;

  const inner = useMemo(() => {
    if (subtype === 'ContractCommunity') {
      return <ContractCommunityView contractAddress={contractAddress} chain={chain as Chain} />;
    }
    if (subtype === 'ArtBlocksCommunity' && projectId) {
      return (
        <ArtBlocksCommunityView
          projectId={projectId}
          contractAddress={contractAddress}
          chain={chain as Chain}
        />
      );
    }
    return null;
  }, [chain, contractAddress, projectId, subtype]);

  return (
    <View className="flex-1 bg-white dark:bg-black-900">
      <Suspense fallback={<CommunityViewFallback />}>{inner}</Suspense>
      {postId && (
        <Suspense fallback={null}>
          <SharePostBottomSheet postId={postId} creatorName={creatorName} />
        </Suspense>
      )}
    </View>
  );
}

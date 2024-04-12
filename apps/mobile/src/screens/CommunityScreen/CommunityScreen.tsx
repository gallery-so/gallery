import { RouteProp, useRoute } from '@react-navigation/native';
import { Suspense, useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { graphql, useFragment, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { GALLERIES_PER_PAGE } from 'src/constants/community';
import { POSTS_PER_PAGE } from 'src/constants/feed';
import { useRefreshHandle } from 'src/hooks/useRefreshHandle';

import { CommunityView } from '~/components/Community/CommunityView';
import { CommunityViewFallback } from '~/components/Community/CommunityViewFallback';
import { GalleryRefreshControl } from '~/components/GalleryRefreshControl';
import { CommunityScreenArtBlocksCommunityQuery } from '~/generated/CommunityScreenArtBlocksCommunityQuery.graphql';
import { CommunityScreenCommunityViewWrapperFragment$key } from '~/generated/CommunityScreenCommunityViewWrapperFragment.graphql';
import { CommunityScreenCommunityViewWrapperQuery } from '~/generated/CommunityScreenCommunityViewWrapperQuery.graphql';
import { CommunityScreenContractCommunityQuery } from '~/generated/CommunityScreenContractCommunityQuery.graphql';
import { Chain } from '~/generated/CommunityScreenContractCommunityQuery.graphql';
import { CommunityScreenRefetchableFragment$key } from '~/generated/CommunityScreenRefetchableFragment.graphql';
import { CommunityScreenRefetchableFragmentQuery } from '~/generated/CommunityScreenRefetchableFragmentQuery.graphql';
import { MainTabStackNavigatorParamList } from '~/navigation/types';

/**
 * How this screen works:
 * 1) using params, decide whether we're going to render a ContractCommunity vs ArtBlocksCommunity
 * 2) explicitly fetch `contractCommunityByKey` and `artBlocksCommunityByKey` accordingly
 * 3) once community is fetched, pass it into a generic CommunityViewWrapper where its ID can be used to refresh the community.
 *    the `$communityID` param is associated with figuring out whether you belong to a community.
 */
export function CommunityScreen() {
  const route = useRoute<RouteProp<MainTabStackNavigatorParamList, 'Community'>>();
  const { subtype, chain, contractAddress, projectId } = route.params;

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
    </View>
  );
}

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
        $galleriesFirst: Int!
        $galleriesAfter: String
      ) {
        community: contractCommunityByKey(key: $contractCommunityInput) @required(action: THROW) {
          ... on Community {
            ...CommunityScreenCommunityViewWrapperFragment
          }
        }
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
      galleriesFirst: GALLERIES_PER_PAGE,
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  return <CommunityViewWrapper communityRef={initializerQuery.community} />;
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
        $galleriesFirst: Int!
        $galleriesAfter: String
      ) {
        community: artBlocksCommunityByKey(key: $artBlocksCommunityInput) @required(action: THROW) {
          ... on Community {
            ...CommunityScreenCommunityViewWrapperFragment
          }
        }
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
      galleriesFirst: GALLERIES_PER_PAGE,
    },
    { fetchPolicy: 'store-or-network', UNSTABLE_renderPolicy: 'partial' }
  );

  return <CommunityViewWrapper communityRef={initializerQuery.community} />;
}

function CommunityViewWrapper({
  communityRef,
}: {
  communityRef: CommunityScreenCommunityViewWrapperFragment$key;
}) {
  const community = useFragment(
    graphql`
      fragment CommunityScreenCommunityViewWrapperFragment on Community {
        dbid
        ...CommunityViewCommunityFragment
      }
    `,
    communityRef
  );

  const wrapperQuery = useLazyLoadQuery<CommunityScreenCommunityViewWrapperQuery>(
    graphql`
      query CommunityScreenCommunityViewWrapperQuery($communityID: DBID!) {
        ...CommunityScreenRefetchableFragment
      }
    `,
    {
      communityID: community.dbid,
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
        <CommunityView queryRef={query} communityRef={community} />
      </ScrollView>
    </View>
  );
}

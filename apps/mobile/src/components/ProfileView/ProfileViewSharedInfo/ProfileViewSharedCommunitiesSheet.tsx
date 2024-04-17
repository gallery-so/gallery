import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { CommunityList } from '~/components/CommunitiesList/CommunityList';
import { Typography } from '~/components/Typography';
import { ProfileViewSharedCommunitiesSheetFragment$key } from '~/generated/ProfileViewSharedCommunitiesSheetFragment.graphql';

type Props = {
  userRef: ProfileViewSharedCommunitiesSheetFragment$key;
};

export const SHARED_COMMUNITIES_PER_PAGE = 20;
export type ContractAddress = {
  address: string | null;
  chain: string | null;
};

export default function ProfileViewSharedCommunitiesSheet(props: Props) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment ProfileViewSharedCommunitiesSheetFragment on GalleryUser
      @refetchable(queryName: "ProfileViewSharedCommunitiesSheetRefetchableFragment") {
        sharedCommunities(first: $sharedCommunitiesFirst, after: $sharedCommunitiesAfter)
          @connection(key: "UserSharedInfoFragment_sharedCommunities") {
          edges {
            node {
              __typename
              ... on Community {
                __typename
                ...CommunityListFragment
              }
            }
          }
        }
      }
    `,
    props.userRef
  );

  const nonNullCommunities = useMemo(() => {
    const communities = [];

    for (const edge of data.sharedCommunities?.edges ?? []) {
      if (edge?.node?.__typename === 'Community' && edge?.node) {
        communities.push(edge.node);
      }
    }

    return communities;
  }, [data.sharedCommunities?.edges]);

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(SHARED_COMMUNITIES_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  return (
    <View className="flex pb-8">
      <Typography
        className="text-sm mb-4 flex flex-row items-center "
        font={{
          family: 'ABCDiatype',
          weight: 'Bold',
        }}
      >
        Items you both own
      </Typography>

      <View className="flex-grow h-full">
        <CommunityList onLoadMore={loadMore} communityRefs={nonNullCommunities} />
      </View>
    </View>
  );
}

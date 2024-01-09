import { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { graphql, usePaginationFragment } from 'react-relay';

import { CommunityList } from '~/components/CommunitiesList/CommunityList';
import {
  GalleryBottomSheetModal,
  GalleryBottomSheetModalType,
} from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { Typography } from '~/components/Typography';
import { ProfileViewSharedCommunitiesSheetFragment$key } from '~/generated/ProfileViewSharedCommunitiesSheetFragment.graphql';

import { useListContentStyle } from '../Tabs/useListContentStyle';

type Props = {
  userRef: ProfileViewSharedCommunitiesSheetFragment$key;
};

const snapPoints = ['50%'];

export const SHARED_COMMUNITIES_PER_PAGE = 20;
export type ContractAddress = {
  address: string | null;
  chain: string | null;
};

function ProfileViewSharedCommunitiesSheet(
  props: Props,
  ref: ForwardedRef<GalleryBottomSheetModalType>
) {
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

  const contentContainerStyle = useListContentStyle();

  const loadMore = useCallback(() => {
    if (hasNext) {
      loadNext(SHARED_COMMUNITIES_PER_PAGE);
    }
  }, [hasNext, loadNext]);

  return (
    <GalleryBottomSheetModal ref={ref} index={0} snapPoints={snapPoints}>
      <View style={contentContainerStyle}>
        <Typography
          className="text-sm mb-4 px-4 flex flex-row items-center "
          font={{
            family: 'ABCDiatype',
            weight: 'Bold',
          }}
        >
          Items you both own
        </Typography>

        <View className="flex-grow">
          <CommunityList onLoadMore={loadMore} communityRefs={nonNullCommunities} />
        </View>
      </View>
    </GalleryBottomSheetModal>
  );
}

const ForwardedProfileViewSharedCommunitiesSheet = forwardRef<GalleryBottomSheetModalType, Props>(
  ProfileViewSharedCommunitiesSheet
);

export { ForwardedProfileViewSharedCommunitiesSheet as ProfileViewSharedCommunitiesSheet };

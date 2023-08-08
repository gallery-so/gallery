/* eslint-disable no-console */
import { useNavigation } from '@react-navigation/native';
import clsx from 'clsx';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useMemo, useRef } from 'react';
import { View, ViewProps } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { InteractiveLink } from '~/components/InteractiveLink';
import { CommunityProfilePicture } from '~/components/ProfilePicture/CommunityProfilePicture';
import { Typography } from '~/components/Typography';
import { ProfileViewSharedCommunitiesBubblesFragment$key } from '~/generated/ProfileViewSharedCommunitiesBubblesFragment.graphql';
import { ProfileViewSharedCommunitiesFragment$key } from '~/generated/ProfileViewSharedCommunitiesFragment.graphql';
import { ProfileViewSharedCommunitiesHoldsTextFragment$key } from '~/generated/ProfileViewSharedCommunitiesHoldsTextFragment.graphql';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { GalleryElementTrackingProps } from '~/shared/contexts/AnalyticsContext';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import colors from '~/shared/theme/colors';

import {
  ContractAddress,
  ProfileViewSharedCommunitiesSheet,
} from './ProfileViewSharedCommunitiesSheet';

type Props = {
  userRef: ProfileViewSharedCommunitiesFragment$key;
};

export default function ProfileViewSharedCommunities({ userRef }: Props) {
  const user = useFragment(
    graphql`
      fragment ProfileViewSharedCommunitiesFragment on GalleryUser {
        __typename
        sharedCommunities(first: $sharedCommunitiesFirst, after: $sharedCommunitiesAfter)
          @connection(key: "UserSharedInfoFragment_sharedCommunities") {
          edges {
            node {
              __typename
              ... on Community {
                __typename
                name
                chain
                contractAddress {
                  address
                  chain
                }
                ...ProfileViewSharedCommunitiesBubblesFragment
                ...ProfileViewSharedCommunitiesHoldsTextFragment
              }
            }
          }
          pageInfo {
            total
          }
        }
        ...ProfileViewSharedCommunitiesSheetFragment
      }
    `,
    userRef
  );

  const sharedCommunities = useMemo(() => {
    const list = user.sharedCommunities?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [user.sharedCommunities?.edges]);

  const totalSharedCommunities = user.sharedCommunities?.pageInfo?.total ?? 0;

  const bottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const handleSeeAllPress = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  if (totalSharedCommunities === 0) {
    return null;
  }

  return (
    <View className="flex flex-row items-center mt-3 mb-2 space-x-1">
      <CommunityProfilePictureBubblesWithCount
        onPress={handleSeeAllPress}
        totalCount={totalSharedCommunities}
        eventElementId="Shared Followers Bubbles"
        eventName="Shared Followers Bubbles pressed"
        userRefs={sharedCommunities}
      />

      <HoldsText
        onSeeAll={handleSeeAllPress}
        communityRefs={sharedCommunities}
        totalCount={totalSharedCommunities}
      />

      <ProfileViewSharedCommunitiesSheet ref={bottomSheetRef} userRef={user} />
    </View>
  );
}

type HoldsTextProps = {
  onSeeAll: () => void;
  style?: ViewProps['style'];
  communityRefs: ProfileViewSharedCommunitiesHoldsTextFragment$key;
  totalCount: number;
};

function HoldsText({ communityRefs, onSeeAll, style, totalCount }: HoldsTextProps) {
  const communities = useFragment(
    graphql`
      fragment ProfileViewSharedCommunitiesHoldsTextFragment on Community @relay(plural: true) {
        __typename
        dbid
        name
        contractAddress {
          address
          chain
        }
      }
    `,
    communityRefs
  );

  const { communities: communitiesToShow, hasMore } = useMemo(() => {
    if (communities.length <= 3) {
      return { communities: communities.slice(0, 3), hasMore: false };
    } else {
      return { communities: communities.slice(0, 2), hasMore: true };
    }
  }, [communities]);

  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const handleCommunityPress = useCallback(
    (contractAddress: ContractAddress) => {
      const { address, chain } = contractAddress ?? {};

      if (!address || !chain) return;
      navigation.push('Community', {
        contractAddress: address,
        chain,
      });
    },
    [navigation]
  );

  const { colorScheme } = useColorScheme();

  return (
    <View className="flex flex-row flex-1 flex-wrap items-center space-x-1" style={style}>
      <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
        Also holds
      </Typography>
      {communitiesToShow.map((community, index) => {
        const isLast = index === communitiesToShow.length - 1;

        return (
          <View key={community.dbid} className="flex flex-row items-center">
            <InteractiveLink
              onPress={() =>
                community.contractAddress && handleCommunityPress(community.contractAddress)
              }
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              type="Shared Communities Name"
              textStyle={{
                fontSize: 12,
                color: colorScheme === 'dark' ? colors.white : colors.black['800'],
              }}
            >
              {community.name}
            </InteractiveLink>
            {(!isLast || hasMore) && (
              <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
                ,
              </Typography>
            )}
          </View>
        );
      })}

      {hasMore && (
        <View className="flex flex-row items-center">
          <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
            and{' '}
          </Typography>

          <InteractiveLink
            onPress={onSeeAll}
            font={{ family: 'ABCDiatype', weight: 'Bold' }}
            type="Shared Communities See All"
            textStyle={{
              fontSize: 12,
              color: colorScheme === 'dark' ? colors.white : colors.black['800'],
            }}
          >
            {totalCount - communitiesToShow.length} others
          </InteractiveLink>
        </View>
      )}
    </View>
  );
}

type CommunityProfilePictureBubblesWithCountProps = {
  userRefs: ProfileViewSharedCommunitiesBubblesFragment$key;
  totalCount: number;
  onPress: () => void;
} & GalleryElementTrackingProps;

export function CommunityProfilePictureBubblesWithCount({
  onPress,
  userRefs,
  totalCount,
  ...trackingProps
}: CommunityProfilePictureBubblesWithCountProps) {
  const communities = useFragment(
    graphql`
      fragment ProfileViewSharedCommunitiesBubblesFragment on Community @relay(plural: true) {
        dbid
        ...CommunityProfilePictureFragment
      }
    `,
    userRefs
  );

  if (communities.length === 0) {
    return null;
  }

  const remainingCount = Math.max(totalCount - 3, 0);

  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      className="flex flex-row items-center"
      {...trackingProps}
    >
      {communities.slice(0, 3).map((community, index) => {
        return (
          <View
            key={community.dbid}
            className={clsx({
              '-ml-2': index !== 0,
            })}
          >
            <CommunityProfilePicture communityRef={community} size="sm" />
          </View>
        );
      })}

      {Boolean(remainingCount) && (
        <View className="bg-porcelain border-2 border-white dark:border-black-900 rounded-3xl px-1.5 -ml-2">
          <Typography
            className="text-xs text-metal"
            font={{ family: 'ABCDiatype', weight: 'Medium' }}
            style={{ fontVariant: ['tabular-nums'] }}
          >
            +{remainingCount}
          </Typography>
        </View>
      )}
    </GalleryTouchableOpacity>
  );
}

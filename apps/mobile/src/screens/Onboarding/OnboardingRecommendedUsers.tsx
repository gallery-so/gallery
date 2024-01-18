import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { RightArrowIcon } from 'src/icons/RightArrowIcon';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { USERS_PER_PAGE } from '~/components/Trending/constants';
import { Typography } from '~/components/Typography';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { OnboardingRecommendedUsersInnerFragment$key } from '~/generated/OnboardingRecommendedUsersInnerFragment.graphql';
import { OnboardingRecommendedUsersQuery } from '~/generated/OnboardingRecommendedUsersQuery.graphql';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import useFollowAllRecommendedUsers from '~/shared/relay/useFollowAllRecommendedUsers';
import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import { navigateToNotificationUpsellOrHomeScreen } from '../Login/navigateToNotificationUpsellOrHomeScreen';

const VERTICAL_GAP_OF_ITEMS = 16;
const NUMBER_OF_ITEMS_EXCLUDING_USER_LIST = 2;
const HEADER_BAR_HEIGHT = 110;
const FOOTER_BAR_HEIGHT = 127;

const HEIGHT_OF_FIXED_ITEMS_ON_SCREEN =
  HEADER_BAR_HEIGHT +
  FOOTER_BAR_HEIGHT +
  NUMBER_OF_ITEMS_EXCLUDING_USER_LIST * VERTICAL_GAP_OF_ITEMS;

export function OnboardingRecommendedUsers() {
  const query = useLazyLoadQuery<OnboardingRecommendedUsersQuery>(
    graphql`
      query OnboardingRecommendedUsersQuery($usersLast: Int!, $usersBefore: String) {
        ...OnboardingRecommendedUsersInnerFragment
      }
    `,
    {
      usersLast: USERS_PER_PAGE,
      usersBefore: null,
    }
  );

  return <OnboardingRecommendedUsersInner queryRef={query} />;
}

type OnboardingRecommendedUsersInnerProps = {
  queryRef: OnboardingRecommendedUsersInnerFragment$key;
};

function OnboardingRecommendedUsersInner({ queryRef }: OnboardingRecommendedUsersInnerProps) {
  const {
    data: followingPagination,
    loadPrevious,
    hasPrevious,
  } = usePaginationFragment(
    graphql`
      fragment OnboardingRecommendedUsersInnerFragment on Query
      @refetchable(queryName: "OnboardingRecommendedUsersInnerQuery") {
        viewer {
          ... on Viewer {
            id

            suggestedUsers(last: $usersLast, before: $usersBefore)
              @connection(key: "OnboardingRecommendedUsersInnerFragment_suggestedUsers") {
              edges {
                node {
                  id
                  __typename
                  ...UserFollowListFragment
                }
              }
            }
          }
        }
        ...useFollowAllRecommendedUsersQueryFragment
        ...UserFollowListQueryFragment
      }
    `,
    queryRef
  );

  const navigation = useNavigation<LoginStackNavigatorProp>();

  const user = followingPagination?.viewer?.id;

  const suggestedFollowingIds = useMemo(() => {
    const userIds = [];

    for (const edge of followingPagination.viewer?.suggestedUsers?.edges ?? []) {
      if (edge?.node?.__typename === 'GalleryUser') {
        userIds.push(edge?.node.id);
      }
    }

    return userIds;
  }, [followingPagination]);

  const windowDimensions = useWindowDimensions();

  const heightOfUserList = windowDimensions.height - HEIGHT_OF_FIXED_ITEMS_ON_SCREEN;

  const followAllRecommendedUsers = useFollowAllRecommendedUsers({
    suggestedFollowingIds: suggestedFollowingIds,
    queryRef: followingPagination,
  });

  const handleNext = useCallback(async () => {
    if (!user) return null;
    await navigateToNotificationUpsellOrHomeScreen(navigation, true);
  }, [navigation, user]);

  const handleFollowAll = useCallback(async () => {
    if (!user) return null;
    followAllRecommendedUsers();
    await handleNext();
  }, [user, followAllRecommendedUsers, handleNext]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const { top } = useSafeAreaInsets();

  const handleLoadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(USERS_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const recommendedUsers = useMemo(() => {
    const list = followingPagination.viewer?.suggestedUsers?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [followingPagination.viewer?.suggestedUsers?.edges]);

  const [hasFollowedSomeone, setHasFollowedSomeone] = useState(false);

  return (
    <View style={{ paddingTop: top }} className="bg-white">
      <View className="flex flex-col flex-grow space-y-4 px-4 bg-white">
        <View className="relative flex-row items-center justify-between ">
          <BackButton onPress={handleBack} />
          <GalleryTouchableOpacity
            onPress={handleNext}
            className="flex flex-row items-center space-x-2"
            eventElementId="Next button on onboarding recommended users screen"
            eventName="Next button on onboarding recommended users screen"
            properties={{ variant: hasFollowedSomeone ? 'Next' : 'Skip' }}
            eventContext={contexts.Onboarding}
          >
            <Typography
              className="text-sm text-metal"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {hasFollowedSomeone ? 'Next' : 'Skip'}
            </Typography>
            <RightArrowIcon color={colors.metal} />
          </GalleryTouchableOpacity>
        </View>

        <View className="flex flex-col">
          <Typography className="text-md" font={{ family: 'ABCDiatype', weight: 'Medium' }}>
            Recommended collectors for you
          </Typography>
          <Typography
            className="text-md text-shadow"
            font={{ family: 'ABCDiatype', weight: 'Medium' }}
          >
            Popular users on gallery
          </Typography>
        </View>

        <View
          style={{
            height: heightOfUserList,
          }}
        >
          <Suspense fallback={<UserFollowListFallback />}>
            <UserFollowList
              onLoadMore={handleLoadMore}
              userRefs={recommendedUsers}
              queryRef={followingPagination}
              onUserPress={noop}
              onFollowPress={() => setHasFollowedSomeone(true)}
              isPresentational={true}
            />
          </Suspense>
        </View>

        <View className="flex justify-end mb-10">
          <Button
            onPress={handleFollowAll}
            variant="primary"
            size="md"
            className="w-full"
            eventElementId="Follow All button on onboarding recommended users screen"
            eventName="Follow All button on onboarding recommended users screen"
            eventContext={contexts.Onboarding}
            text="FOLLOW ALL"
          />
        </View>
      </View>
    </View>
  );
}

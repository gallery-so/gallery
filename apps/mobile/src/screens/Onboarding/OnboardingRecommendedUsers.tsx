import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery, usePaginationFragment } from 'react-relay';
import { RightArrowIcon } from 'src/icons/RightArrowIcon';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { SuggestedUserFollowList } from '~/components/SuggestedUserFollowList/SuggestedUserFollowList';
import { USERS_PER_PAGE } from '~/components/Trending/constants';
import { Typography } from '~/components/Typography';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { OnboardingRecommendedUsersInnerFragment$key } from '~/generated/OnboardingRecommendedUsersInnerFragment.graphql';
import { OnboardingRecommendedUsersQuery } from '~/generated/OnboardingRecommendedUsersQuery.graphql';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import useFollowAllRecommendedUsers from '~/shared/relay/useFollowAllRecommendedUsers';
import colors from '~/shared/theme/colors';

import { navigateToNotificationUpsellOrHomeScreen } from '../Login/navigateToNotificationUpsellOrHomeScreen';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { noop } from '~/shared/utils/noop';

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

  const suggestedFollowing = useMemo(() => {
    const users = [];

    for (const edge of followingPagination.viewer?.suggestedUsers?.edges ?? []) {
      if (edge?.node?.__typename === 'GalleryUser') {
        users.push(edge?.node);
      }
    }

    return users;
  }, [followingPagination]);

  const followAllRecommendedUsers = useFollowAllRecommendedUsers({
    suggestedFollowing: suggestedFollowing,
    queryRef: followingPagination,
  });

  const handleNext = useCallback(async () => {
    if (!user) return null;
    await navigateToNotificationUpsellOrHomeScreen(navigation, true);
  }, [navigation, user]);

  const handleFollowAll = useCallback(async () => {
    if (!user) return null;
    followAllRecommendedUsers();
    setTimeout(async () => await handleNext(), 800);
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

        <View className="h-2/3 mb-14">
          <Suspense fallback={<UserFollowListFallback />}>
            <UserFollowList
              onLoadMore={handleLoadMore}
              userRefs={recommendedUsers}
              queryRef={followingPagination}
              onUserPress={(username: string) => {}}
              onFollowPress={() => setHasFollowedSomeone(true)}
              isPresentational={true}
            />
          </Suspense>
        </View>

        <View className="flex justify-end">
          <Button
            onPress={handleFollowAll}
            variant="primary"
            size="md"
            className="w-full mt-4"
            eventElementId="Next button on onboarding recommended screen"
            eventName="Next button on onboarding recommended screen"
            eventContext={contexts.Onboarding}
            text="FOLLOW ALL"
          />
        </View>
      </View>
    </View>
  );
}

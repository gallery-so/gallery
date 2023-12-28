import { useNavigation } from '@react-navigation/native';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { graphql, useLazyLoadQuery, usePaginationFragment, useFragment } from 'react-relay';
import { RightArrowIcon } from 'src/icons/RightArrowIcon';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { USERS_PER_PAGE } from '~/components/Trending/constants';
import { Typography } from '~/components/Typography';
import { Markdown } from '~/components/Markdown';
import { UserFollowList } from '~/components/UserFollowList/UserFollowList';
import { UserFollowListFallback } from '~/components/UserFollowList/UserFollowListFallback';
import { OnboardingRecommendedUsersQuery } from '~/generated/OnboardingRecommendedUsersQuery.graphql';
import { LoginStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';
import { removeNullValues } from '~/shared/relay/removeNullValues';
import useFollowAllRecommendedUsers from '~/shared/relay/useFollowAllRecommendedUsers';
import colors from '~/shared/theme/colors';
import { FollowButton } from '~/components/FollowButton';
import { SuggestedUserFollowList } from '~/components/SuggestedUserFollowList/SuggestedUserFollowList';

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

function OnboardingRecommendedUsersInner({ queryRef }) {
  const {
    data: followingPagination,
    loadPrevious,
    hasPrevious,
    isLoadingPrevious,
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
                  ...SuggestedUserFollowListFragment
                }
              }
            }
          }
        }

        ...SuggestedUserFollowListQueryFragment
      }
    `,
    queryRef
  );

  const [hasFollowedSomeone, setHasFollowedSomeone] = useState(false);
  const navigation = useNavigation<LoginStackNavigatorProp>();

  const followAllRecommendedUsers = useFollowAllRecommendedUsers();

  const handleNext = useCallback(() => {
    followAllRecommendedUsers();
  }, []);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const { top, bottom } = useSafeAreaInsets();

  const handleLoadMore = useCallback(() => {
    if (hasPrevious) {
      loadPrevious(USERS_PER_PAGE);
    }
  }, [hasPrevious, loadPrevious]);

  const recommendedUsers = useMemo(() => {
    const list = followingPagination.viewer?.suggestedUsers?.edges?.map((edge) => edge?.node) ?? [];
    return removeNullValues(list);
  }, [followingPagination.viewer?.suggestedUsers?.edges]);

  // console.log('suggestedUsers', followingPagination.viewer?.suggestedUsers);
  // console.log('recommendedUsers', recommendedUsers);

  return (
    <View style={{ paddingTop: top }}>
      <View className="flex flex-col flex-grow space-y-4 px-4">
        <View className="relative flex-row items-center justify-between ">
          <BackButton onPress={handleBack} />
          <View className="flex flex-row items-center space-x-2">
            <Typography
              className="text-sm text-metal"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              {hasFollowedSomeone ? 'Next' : 'Skip'}
            </Typography>
            <RightArrowIcon color={colors.metal} />
          </View>
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

        <View className="h-4/6 mb-14">
          <Suspense fallback={<UserFollowListFallback />}>
            <SuggestedUserFollowList
              onLoadMore={handleLoadMore}
              userRefs={recommendedUsers}
              queryRef={followingPagination}
            />
          </Suspense>
        </View>

        <View className="flex flex-1 justify-end">
          <Button
            onPress={handleNext}
            variant="primary"
            size="custom"
            className="w-full"
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

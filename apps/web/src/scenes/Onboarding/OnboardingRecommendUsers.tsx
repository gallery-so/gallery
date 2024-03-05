import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { Button } from '~/components/core/Button/Button';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import FullPageCenteredStep from '~/components/Onboarding/FullPageCenteredStep';
import { OnboardingFooter } from '~/components/Onboarding/OnboardingFooter';
import ProcessedText from '~/components/ProcessedText/ProcessedText';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { OnboardingRecommendUsersQuery } from '~/generated/OnboardingRecommendUsersQuery.graphql';
import useFollowAllRecommendedUsers from '~/shared/relay/useFollowAllRecommendedUsers';

import { OnboardingContainer } from './style';

const onboardingStepName = 'recommend-users';

export function OnboardingRecommendUsers() {
  const query = useLazyLoadQuery<OnboardingRecommendUsersQuery>(
    graphql`
      query OnboardingRecommendUsersQuery {
        viewer @required(action: THROW) {
          ... on Viewer {
            id
            user {
              username
            }
            socialAccounts {
              farcaster {
                __typename
              }
            }
            suggestedUsers(last: 5) {
              edges {
                node {
                  __typename
                  dbid
                  id
                  username
                  bio
                  ...ProfilePictureFragment
                  ...FollowButtonUserFragment
                }
              }
            }
          }
        }
        ...FollowButtonQueryFragment
        ...useFollowAllRecommendedUsersQueryFragment
      }
    `,
    {}
  );

  const { push } = useRouter();
  const username = query.viewer?.user?.username;
  const farcaster = query.viewer?.socialAccounts?.farcaster;

  const subheadingText = useMemo(() => {
    if (farcaster) {
      return 'Based on your onchain contacts from places like Farcaster';
    }

    return 'Based on your collection';
  }, [farcaster]);

  const nonNullUsers = useMemo(() => {
    const users = [];

    for (const edge of query.viewer.suggestedUsers?.edges ?? []) {
      if (edge?.node) {
        users.push(edge.node);
      }
    }

    return users;
  }, [query.viewer.suggestedUsers?.edges]);

  const suggestedFollowingIds = useMemo(() => {
    const userIds = [];

    for (const edge of query.viewer?.suggestedUsers?.edges ?? []) {
      if (edge?.node?.__typename === 'GalleryUser') {
        userIds.push(edge?.node.id);
      }
    }

    return userIds;
  }, [query]);

  const userProfileRoute: Route = useMemo(
    () => ({
      pathname: '/[username]',
      query: {
        username: `${username as string}`,
        onboarding: 'true',
      },
    }),
    [username]
  );

  const redirectToProfile = useCallback(() => {
    push(userProfileRoute);
  }, [push, userProfileRoute]);

  const followAllRecommendedUsers = useFollowAllRecommendedUsers({
    suggestedFollowingIds: suggestedFollowingIds,
    queryRef: query,
  });
  const handleFollowAll = useCallback(() => {
    followAllRecommendedUsers();
    redirectToProfile();
  }, [followAllRecommendedUsers, redirectToProfile]);

  const handlePrevious = useCallback(() => {
    push('/onboarding/add-persona');
  }, [push]);

  return (
    <VStack>
      <FullPageCenteredStep stepName={onboardingStepName}>
        <StyledOnboardingContainer>
          <VStack gap={4}>
            <StyledHeaderText>Recommended collectors</StyledHeaderText>
            <BaseM color={colors.shadow}>{subheadingText}</BaseM>
          </VStack>

          <StyledListUsersContainer gap={16}>
            {nonNullUsers.map((user) => {
              return (
                <HStack key={user.dbid} gap={8} justify="space-between" align="center">
                  <ProfilePicture userRef={user} size="md" />
                  <VStack grow>
                    <BaseM>{user.username}</BaseM>
                    <StyledSubHeaderText>
                      <ProcessedText text={user.bio ?? ''} eventContext={null}></ProcessedText>
                    </StyledSubHeaderText>
                  </VStack>
                  <FollowButton userRef={user} queryRef={query} variant="secondary" />
                </HStack>
              );
            })}
          </StyledListUsersContainer>

          <StyledButtonContainer>
            <Button
              eventElementId="Follow All button on onboarding recommended users screen"
              eventName="Click Follow All button on onboarding recommended users screen"
              eventContext={contexts.Onboarding}
              onClick={handleFollowAll}
            >
              Follow all
            </Button>
          </StyledButtonContainer>
        </StyledOnboardingContainer>
      </FullPageCenteredStep>
      <OnboardingFooter
        step={onboardingStepName}
        onNext={redirectToProfile}
        isNextEnabled
        nextButtonVariant="secondary"
        previousTextOverride="Back"
        onPrevious={handlePrevious}
      />
    </VStack>
  );
}

const StyledHeaderText = styled(BaseM)`
  font-weight: 700;
`;

const StyledSubHeaderText = styled(BaseM)`
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 24px;
  max-height: 24px;
`;

const StyledListUsersContainer = styled(VStack)`
  padding: 0 16px;
`;
const StyledButtonContainer = styled(VStack)`
  padding: 24px 16px;
`;

const StyledOnboardingContainer = styled(OnboardingContainer)`
  padding: 0 16px;
  width: 100%;
  @media only screen and ${breakpoints.tablet} {
    width: 480px;
  }
`;

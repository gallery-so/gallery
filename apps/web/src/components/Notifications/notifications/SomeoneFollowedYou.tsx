import { useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import FollowButton from '~/components/Follow/FollowButton';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { SomeoneFollowedYouFragment$key } from '~/generated/SomeoneFollowedYouFragment.graphql';
import { SomeoneFollowedYouQueryFragment$key } from '~/generated/SomeoneFollowedYouQueryFragment.graphql';

type SomeoneFollowedYouProps = {
  notificationRef: SomeoneFollowedYouFragment$key;
  queryRef: SomeoneFollowedYouQueryFragment$key;
  onClose: () => void;
};

export function SomeoneFollowedYou({
  notificationRef,
  queryRef,
  onClose,
}: SomeoneFollowedYouProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneFollowedYouFragment on SomeoneFollowedYouNotification {
        count

        followers(last: 1) {
          edges {
            node {
              ...FollowButtonUserFragment
              ...HoverCardOnUsernameFragment
              ...ProfilePictureFragment
              ... on GalleryUser {
                dbid
              }
            }
          }
        }
      }
    `,
    notificationRef
  );

  const query = useFragment(
    // eslint-disable-next-line relay/graphql-syntax
    graphql`
      fragment SomeoneFollowedYouQueryFragment on Query {
        ...FollowButtonQueryFragment
        viewer {
          ... on Viewer {
            user {
              id
              following {
                id
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const count = notification.count ?? 1;
  const lastFollower = notification.followers?.edges?.[0]?.node;

  const isFollowingBack = useMemo(() => {
    const followingList = new Set(
      (query.viewer?.user?.following ?? []).map((following: { id: string } | null) =>
        following?.id?.replace('GalleryUser:', '')
      )
    );
    const lastFollowerUser = notification.followers?.edges?.[0];
    if (lastFollowerUser && !followingList.has(lastFollowerUser.node?.dbid)) {
      return true;
    }
    return false;
  }, [query.viewer?.user?.following, notification.followers?.edges]);

  const [isInitiallyFollowingBack] = useState(isFollowingBack);
  const shouldShowFollowBackButton =
    count === 1 && lastFollower && (isInitiallyFollowingBack || isFollowingBack);

  return (
    <StyledHStack justify="space-between" align="center">
      <StyledContainer  gap={4} align="center">
        {count > 1 ? (
          <BaseM>
            <strong>{count} collectors</strong>
          </BaseM>
        ) : (
          <>
            {lastFollower ? (
              <HStack gap={8} align="center">
                <ProfilePicture size="md" userRef={lastFollower} />
                <HoverCardOnUsername userRef={lastFollower} onClick={onClose} />
              </HStack>
            ) : (
              <BaseM>
                <strong>Someone</strong>
              </BaseM>
            )}
          </>
        )}
        <BaseM>followed you</BaseM>
      </StyledContainer>
      {shouldShowFollowBackButton && <StyledFollowButton queryRef={query} userRef={lastFollower} />}
    </StyledHStack>
  );
}

const StyledHStack = styled(HStack)`
  width: 100%;
`;

const StyledContainer = styled(HStack)`
  display: flex;
  flex-wrap: wrap;
`;

const StyledFollowButton = styled(FollowButton)`
  width: 92px;
  height: 24px;
`;

import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import UserHoverCard from '~/components/HoverCard/UserHoverCard';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { ProfilePictureStack } from '~/components/ProfilePicture/ProfilePictureStack';
import { SomeoneViewedYourGalleryFragment$key } from '~/generated/SomeoneViewedYourGalleryFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

type SomeoneViewedYourGalleryProps = {
  notificationRef: SomeoneViewedYourGalleryFragment$key;
  onClose: () => void;
};

const testId = 'SomeoneViewedYourGallery';

export function SomeoneViewedYourGallery({
  notificationRef,
  onClose,
}: SomeoneViewedYourGalleryProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryFragment on SomeoneViewedYourGalleryNotification {
        __typename

        nonUserViewerCount

        userViewers(last: 3) {
          pageInfo {
            total
          }

          edges {
            node {
              ...UserHoverCardFragment
              ...ProfilePictureFragment
              ...ProfilePictureStackFragment
            }
          }
        }
      }
    `,
    notificationRef
  );

  const userViewerCount = notification.userViewers?.pageInfo?.total ?? 0;
  const nonUserViewerCount = notification.nonUserViewerCount ?? 0;
  const totalViewCount = userViewerCount + nonUserViewerCount;

  const totalViewerUsers = useMemo(() => {
    return removeNullValues(notification.userViewers?.edges?.map((edge) => edge?.node));
  }, [notification.userViewers?.edges]);

  if (userViewerCount > 0) {
    const lastViewer = notification.userViewers?.edges?.[0]?.node;

    if (totalViewCount === 1) {
      return (
        <HStack data-testid={testId} align="center" gap={4}>
          {lastViewer ? (
            <HStack inline gap={8} align="center">
              <ProfilePicture size="md" userRef={lastViewer} />
              <UserHoverCard onClick={onClose} userRef={lastViewer} />
            </HStack>
          ) : (
            <BaseM>Someone</BaseM>
          )}
          <BaseM> viewed your gallery</BaseM>
        </HStack>
      );
    } else {
      const remainingViewCount = totalViewCount - 1;

      return (
        <StyledProfilePictureStackContainer align="center" data-testid={testId} gap={6}>
          <ProfilePictureStack usersRef={totalViewerUsers} total={userViewerCount} />

          <BaseM>
            {lastViewer ? <UserHoverCard userRef={lastViewer} /> : 'Someone'}
            <span>
              {' '}
              and {remainingViewCount} {remainingViewCount === 1 ? 'other' : 'others'} viewed your
              gallery
            </span>
          </BaseM>
        </StyledProfilePictureStackContainer>
      );
    }
  } else if (nonUserViewerCount > 0) {
    if (nonUserViewerCount === 1) {
      return (
        <BaseM data-testid={testId}>
          <strong>An anonymous user</strong>
          <span> viewed your gallery</span>
        </BaseM>
      );
    } else {
      return (
        <BaseM data-testid={testId}>
          <strong>{nonUserViewerCount} anonymous users</strong>
          <span> viewed your gallery</span>
        </BaseM>
      );
    }
  }

  // If we get here, it means the backend is failing for some reason
  return (
    <BaseM data-testid={testId}>
      <strong>Someone</strong>
      <span> viewed your gallery</span>
    </BaseM>
  );
}

const StyledProfilePictureStackContainer = styled(HStack)`
  padding-right: 8px;
`;

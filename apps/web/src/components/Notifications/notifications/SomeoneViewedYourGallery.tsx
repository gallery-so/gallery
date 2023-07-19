import { useMemo } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { ProfilePictureStack } from '~/components/ProfilePictureStack';
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
              ...HoverCardOnUsernameFragment
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
            <HStack inline gap={4} align="center">
              <ProfilePicture size="sm" userRef={lastViewer} />
              <HoverCardOnUsername onClick={onClose} userRef={lastViewer} />
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
        <BaseM data-testid={testId}>
          {/* <HStack align="center" style={{ display: 'inline-flex' }}> */}
          <StyledProfilePictureStackContainer>
            <ProfilePictureStack usersRef={totalViewerUsers} total={userViewerCount} />
          </StyledProfilePictureStackContainer>
          {/* </HStack> */}
          {lastViewer ? <HoverCardOnUsername userRef={lastViewer} /> : 'Someone'}
          {/* <BaseM> */}
          <span>
            {' '}
            and {remainingViewCount} {remainingViewCount === 1 ? 'other' : 'others'} viewed your
            gallery
          </span>
          {/* </BaseM> */}
        </BaseM>
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

const StyledProfilePictureStackContainer = styled.div`
  display: inline-block;
  padding-right: 4px;
`;

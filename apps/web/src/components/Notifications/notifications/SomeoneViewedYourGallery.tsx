import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { SomeoneViewedYourGalleryFragment$key } from '~/generated/SomeoneViewedYourGalleryFragment.graphql';

type SomeoneViewedYourGalleryProps = {
  notificationRef: SomeoneViewedYourGalleryFragment$key;
};

const testId = 'SomeoneViewedYourGallery';

export function SomeoneViewedYourGallery({ notificationRef }: SomeoneViewedYourGalleryProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryFragment on SomeoneViewedYourGalleryNotification {
        __typename

        nonUserViewerCount

        userViewers(last: 1) {
          pageInfo {
            total
          }

          edges {
            node {
              ...HoverCardOnUsernameFragment
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

  if (userViewerCount > 0) {
    const lastViewer = notification.userViewers?.edges?.[0]?.node;

    if (totalViewCount === 1) {
      return (
        <BaseM data-testid={testId}>
          {lastViewer ? <HoverCardOnUsername userRef={lastViewer} /> : 'Someone'}
          <span> viewed your gallery</span>
        </BaseM>
      );
    } else {
      const remainingViewCount = totalViewCount - 1;

      return (
        <BaseM data-testid={testId}>
          {lastViewer ? <HoverCardOnUsername userRef={lastViewer} /> : 'Someone'}
          <span>
            {' '}
            and {remainingViewCount} {remainingViewCount === 1 ? 'other' : 'others'} viewed your
            gallery
          </span>
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

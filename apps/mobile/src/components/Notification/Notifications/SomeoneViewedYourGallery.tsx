import { Text } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { Typography } from '~/components/Typography';
import { SomeoneViewedYourGalleryFragment$key } from '~/generated/SomeoneViewedYourGalleryFragment.graphql';

type Props = {
  notificationRef: SomeoneViewedYourGalleryFragment$key;
};

export function SomeoneViewedYourGallery({ notificationRef }: Props) {
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
              __typename
              username
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
        <Text>
          {lastViewer ? <UsernameText text={lastViewer.username ?? ''} /> : 'Someone'} {''}
          viewed your gallery
        </Text>
      );
    } else {
      const remainingViewCount = totalViewCount - 1;

      return (
        <Text>
          {lastViewer ? <UsernameText text={lastViewer.username ?? ''} /> : 'Someone'} and{' '}
          {remainingViewCount} {remainingViewCount === 1 ? 'other' : 'others'} viewed your gallery
        </Text>
      );
    }
  } else if (nonUserViewerCount > 0) {
    if (nonUserViewerCount === 1) {
      return (
        <Text>
          <UsernameText text="An anonymous user" />
          viewed your gallery
        </Text>
      );
    } else {
      return (
        <Text>
          <UsernameText text={`${nonUserViewerCount} anonymous users`} />
          viewed your gallery
        </Text>
      );
    }
  }

  // If we get here, it means the backend is failing for some reason
  return (
    <Text>
      <UsernameText text="Someone" /> <Text>viewed your gallery</Text>
    </Text>
  );
}

type UsernameTextProps = {
  text: string;
};

function UsernameText({ text }: UsernameTextProps) {
  return (
    <Typography
      font={{
        family: 'ABCDiatype',
        weight: 'Bold',
      }}
    >
      {text}
    </Typography>
  );
}

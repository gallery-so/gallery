import { SomeoneViewedYourGalleryFragment$key } from '__generated__/SomeoneViewedYourGalleryFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';

type SomeoneViewedYourGalleryProps = {
  notificationRef: SomeoneViewedYourGalleryFragment$key;
};

export function SomeoneViewedYourGallery({ notificationRef }: SomeoneViewedYourGalleryProps) {
  const notification = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryFragment on SomeoneViewedYourGalleryNotification {
        __typename

        count
        userViewers {
          edges {
            node {
              username
            }
          }
        }
      }
    `,
    notificationRef
  );

  const count = notification.count ?? 1;
  const lastViewersUsername = notification.userViewers?.edges?.[0]?.node?.username;

  return (
    <>
      <BaseM>
        {count > 1 ? (
          <>
            <strong>{count} collectors</strong>
            have viewed your gallery
          </>
        ) : (
          <>
            <strong>{lastViewersUsername ?? 'Someone'}</strong> has viewed your gallery
          </>
        )}
      </BaseM>
    </>
  );
}

import { SomeoneViewedYourGalleryFragment$key } from '__generated__/SomeoneViewedYourGalleryFragment.graphql';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { BaseM } from '~/components/core/Text/Text';
import HoverCardOnUsername from '~/components/HoverCard/HoverCardOnUsername';
import { SomeoneViewedYourGalleryQueryFragment$key } from '~/generated/SomeoneViewedYourGalleryQueryFragment.graphql';

type SomeoneViewedYourGalleryProps = {
  notificationRef: SomeoneViewedYourGalleryFragment$key;
  queryRef: SomeoneViewedYourGalleryQueryFragment$key;
};

export function SomeoneViewedYourGallery({
  notificationRef,
  queryRef,
}: SomeoneViewedYourGalleryProps) {
  const query = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryQueryFragment on Query {
        ...HoverCardOnUsernameFollowFragment
      }
    `,
    queryRef
  );

  const notification = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryFragment on SomeoneViewedYourGalleryNotification {
        __typename

        count
        userViewers {
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

  const count = notification.count ?? 1;
  const lastViewer = notification.userViewers?.edges?.[0]?.node;

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
            <strong>
              {lastViewer ? (
                <HoverCardOnUsername userRef={lastViewer} queryRef={query} />
              ) : (
                'Someone'
              )}
            </strong>{' '}
            has viewed your gallery
          </>
        )}
      </BaseM>
    </>
  );
}

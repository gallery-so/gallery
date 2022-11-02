import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { SomeoneViewedYourGalleryFragment$key } from '__generated__/SomeoneViewedYourGalleryFragment.graphql';

type SomeoneViewedYourGalleryProps = {
  notificationRef: SomeoneViewedYourGalleryFragment$key;
};

export function SomeoneViewedYourGallery({ notificationRef }: SomeoneViewedYourGalleryProps) {
  const someoneViewedYourGalleryNotification = useFragment(
    graphql`
      fragment SomeoneViewedYourGalleryFragment on SomeoneViewedYourGalleryNotification {
        __typename
      }
    `,
    notificationRef
  );

  return (
    <>
      <BaseM>
        <strong>
          {notification.count > 1 ? <>{notification.count} collectors</> : <>{notification.who}</>}
        </strong>{' '}
        viewed your gallery
      </BaseM>
    </>
  );
}

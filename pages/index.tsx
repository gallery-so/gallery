import LandingPageScene from 'scenes/LandingPage/LandingPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { useSubscription } from 'react-relay';
import { graphql } from 'relay-runtime';
import { pagesSubscription } from '../__generated__/pagesSubscription.graphql';

export default function Index() {
  useSubscription<pagesSubscription>({
    variables: {},
    onNext: (response) => {
      console.log(response);
    },
    subscription: graphql`
      subscription pagesSubscription {
        newNotification {
          id
          seen
        }
      }
    `,
  });

  return <GalleryRoute element={<LandingPageScene />} navbar={false} />;
}

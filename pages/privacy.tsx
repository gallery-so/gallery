import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import PrivacyPolicyPage from 'scenes/BasicTextPage/PrivacyPolicyPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { privacyQuery } from '__generated__/privacyQuery.graphql';

export default function Privacy() {
  const query = useLazyLoadQuery<privacyQuery>(
    graphql`
      query privacyQuery {
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return <GalleryRoute queryRef={query} element={<PrivacyPolicyPage />} navbar={false} />;
}

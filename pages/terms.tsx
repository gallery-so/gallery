import { graphql, useLazyLoadQuery } from 'react-relay';
import TermsPage from 'scenes/BasicTextPage/TermsPage';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { termsQuery } from '__generated__/termsQuery.graphql';

export default function Terms() {
  const query = useLazyLoadQuery<termsQuery>(
    graphql`
      query termsQuery {
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return <GalleryRoute queryRef={query} element={<TermsPage />} navbar={false} />;
}

import GalleryRoute from 'scenes/_Router/GalleryRoute';
import SilverMembershipMintPage from 'scenes/MembershipMintPage/SilverMembershipMintPage';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { silverQuery } from '__generated__/silverQuery.graphql';

export default function SilverMembership() {
  const query = useLazyLoadQuery<silverQuery>(
    graphql`
      query silverQuery {
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return <GalleryRoute queryRef={query} element={<SilverMembershipMintPage />} navbar={false} />;
}

import GalleryRoute from 'scenes/_Router/GalleryRoute';
import GoldMembershipMintPage from 'scenes/MembershipMintPage/GoldMembershipMintPage';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { goldQuery } from '__generated__/goldQuery.graphql';

export default function SilverMembership() {
  const query = useLazyLoadQuery<goldQuery>(
    graphql`
      query goldQuery {
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return <GalleryRoute queryRef={query} element={<GoldMembershipMintPage />} navbar={false} />;
}

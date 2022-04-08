import GalleryRoute from 'scenes/_Router/GalleryRoute';
import MemberListPage from 'scenes/MemberListPage/MemberListPage';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { membersQuery } from '../__generated__/membersQuery.graphql';

export default function Members() {
  const query = useLazyLoadQuery<membersQuery>(
    graphql`
      query membersQuery {
        ...MemberListPageFragment
      }
    `,
    {}
  );

  return (
    <GalleryRoute
      element={<MemberListPage queryRef={query} />}
      navbar={false}
      footerVisibleOutOfView
    />
  );
}

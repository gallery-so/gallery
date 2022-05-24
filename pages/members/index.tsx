import MemberListPage from 'scenes/MemberListPage/MemberListPage';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { membersQuery } from '../../__generated__/membersQuery.graphql';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function Members() {
  const query = useLazyLoadQuery<membersQuery>(
    graphql`
      query membersQuery {
        ...MemberListPageFragment
      }
    `,
    {}
  );

  return <GalleryRoute navbar={false} element={<MemberListPage queryRef={query} />} />;
}

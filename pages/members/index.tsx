import MemberListPage from 'scenes/MemberListPage/MemberListPage';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { membersQuery } from '../../__generated__/membersQuery.graphql';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';

export default function Members() {
  const query = useLazyLoadQuery<membersQuery>(
    graphql`
      query membersQuery {
        ...MemberListPageFragment
      }
    `,
    {}
  );

  return <GalleryV2Route navbar={false} element={<MemberListPage queryRef={query} />} />;
}

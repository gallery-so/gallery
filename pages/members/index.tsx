import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { membersQuery } from '~/generated/membersQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import MemberListPage from '~/scenes/MemberListPage/MemberListPage';

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

import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { generalQuery } from '~/generated/generalQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import GeneralMembershipMintPage from '~/scenes/MembershipMintPage/GeneralMembershipMintPage';

export default function General() {
  const query = useLazyLoadQuery<generalQuery>(
    graphql`
      query generalQuery {
        ...GeneralMembershipMintPageFragment
      }
    `,
    {}
  );

  return <GalleryRoute element={<GeneralMembershipMintPage queryRef={query} />} navbar={false} />;
}

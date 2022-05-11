import GeneralMembershipMintPage from 'scenes/MembershipMintPage/GeneralMembershipMintPage';

import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { FeatureFlag } from 'components/core/enums';
import { isFeatureEnabled } from 'utils/featureFlag';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { generalQuery } from '__generated__/generalQuery.graphql';
import GalleryRoute from 'scenes/_Router/GalleryRoute';

export default function General() {
  const query = useLazyLoadQuery<generalQuery>(
    graphql`
      query generalQuery {
        ...GeneralMembershipMintPageFragment
      }
    `,
    {}
  );

  if (!isFeatureEnabled(FeatureFlag.GENERAL_MEMBERSHIP_MINT)) {
    return <GalleryRedirect to="/" />;
  }

  return <GalleryRoute element={<GeneralMembershipMintPage queryRef={query} />} navbar={false} />;
}

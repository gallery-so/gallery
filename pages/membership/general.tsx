import GalleryRoute from 'scenes/_Router/GalleryRoute';
import GeneralMembershipMintPage from 'scenes/MembershipMintPage/GeneralMembershipMintPage';

import GalleryRedirect from 'scenes/_Router/GalleryRedirect';
import { FeatureFlag } from 'components/core/enums';
import { isFeatureEnabled } from 'utils/featureFlag';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import { generalQuery } from '__generated__/generalQuery.graphql';

export default function General() {
  const query = useLazyLoadQuery<generalQuery>(
    graphql`
      query generalQuery {
        ...GalleryRouteFragment
        ...GeneralMembershipMintPageFragment
      }
    `,
    {}
  );

  if (!isFeatureEnabled(FeatureFlag.GENERAL_MEMBERSHIP_MINT)) {
    return <GalleryRedirect to="/" />;
  }

  return (
    <GalleryRoute
      queryRef={query}
      element={<GeneralMembershipMintPage queryRef={query} />}
      navbar={false}
    />
  );
}

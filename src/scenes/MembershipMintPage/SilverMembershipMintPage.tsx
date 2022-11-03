import MembershipMintPageProvider from '~/contexts/membershipMintPage/MembershipMintPageContext';

import { MEMBERSHIP_NFT_SILVER } from './cardProperties';
import PremiumMembershipMintPage from './PremiumMembershipMintPage';

function SilverMembershipMintPage() {
  return (
    <MembershipMintPageProvider>
      <PremiumMembershipMintPage membershipNft={MEMBERSHIP_NFT_SILVER} />
    </MembershipMintPageProvider>
  );
}

export default SilverMembershipMintPage;

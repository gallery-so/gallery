import { MEMBERSHIP_NFT_SILVER } from './cardProperties';
import PremiumMembershipMintPage from './PremiumMembershipMintPage';
import MembershipMintPageProvider from 'contexts/membershipMintPage/MembershipMintPageContext';

function SilverMembershipMintPage() {
  return (
    <MembershipMintPageProvider>
      <PremiumMembershipMintPage membershipNft={MEMBERSHIP_NFT_SILVER} />
    </MembershipMintPageProvider>
  );
}

export default SilverMembershipMintPage;

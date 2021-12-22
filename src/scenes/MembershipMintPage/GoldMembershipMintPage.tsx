import { MEMBERSHIP_NFT_GOLD } from './cardProperties';
import PremiumMembershipMintPage from './PremiumMembershipMintPage';
import MembershipMintPageProvider from 'contexts/membershipMintPage/MembershipMintPageContext';

function GoldMembershipMintPage() {
  return (
    <MembershipMintPageProvider>
      <PremiumMembershipMintPage membershipNft={MEMBERSHIP_NFT_GOLD} />;
    </MembershipMintPageProvider>
  );
}

export default GoldMembershipMintPage;

import { MembershipColor } from './cardProperties';
import MembershipMintPage from './MembershipMintPage';

function GoldMembershipMintPage() {
  return (<MembershipMintPage membershipColor={MembershipColor.GOLD}/>);
}

export default GoldMembershipMintPage;

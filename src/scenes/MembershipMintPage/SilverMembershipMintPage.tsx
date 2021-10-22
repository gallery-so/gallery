import { MembershipColor } from './cardProperties';
import MembershipMintPage from './MembershipMintPage';

function SilverMembershipMintPage() {
  return (<MembershipMintPage membershipColor={MembershipColor.SILVER}/>);
}

export default SilverMembershipMintPage;

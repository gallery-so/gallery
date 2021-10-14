import MembershipMintPage from './MembershipMintPage';

const description = `Become a member of Gallery.\n
Holding this grants you the ability to you to sign up as a new user and access the Gallery beta. You must be holding a membership card at all times in order to continue updating your gallery.\n
While the Silver Member Card supply is capped at 500, we will be releasing other tiers of Member Cards for future users.\n
Note that Gallery will be eventually open to all. We are currently restricting access while in beta.\n
Therefore the primary tangible benefit of acquiring this NFT is to gain early access to Gallery.\n
Limit 1 per wallet address.`;

function WhiteMembershipMintPage() {
  return (<MembershipMintPage title="White Member Card" description={description}/>);
}

export default WhiteMembershipMintPage;

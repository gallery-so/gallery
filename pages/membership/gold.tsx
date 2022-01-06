import GalleryRoute from 'scenes/_Router/GalleryRoute';
import GoldMembershipMintPage from 'scenes/MembershipMintPage/GoldMembershipMintPage';

export default function SilverMembership() {
  return <GalleryRoute path="/membership/gold" component={GoldMembershipMintPage} navbar={false} />;
}

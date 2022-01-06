import GalleryRoute from 'scenes/_Router/GalleryRoute';
import SilverMembershipMintPage from 'scenes/MembershipMintPage/SilverMembershipMintPage';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

export default function WhiteMembership() {
  // This page is disabled
  return <GalleryRedirect to="/" />;

  // return (
  //   <GalleryRoute path="/membership/white" component={WhiteMembershipMintPage} navbar={false} />
  // );
}

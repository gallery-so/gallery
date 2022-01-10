import GalleryRoute from 'scenes/_Router/GalleryRoute';
import SilverMembershipMintPage from 'scenes/MembershipMintPage/SilverMembershipMintPage';

export default function SilverMembership() {
  return <GalleryRoute element={<SilverMembershipMintPage />} navbar={false} />;
}

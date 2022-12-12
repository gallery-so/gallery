import EthereumProviders from '~/contexts/auth/EthereumProviders';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import SilverMembershipMintPage from '~/scenes/MembershipMintPage/SilverMembershipMintPage';

export default function SilverMembership() {
  return (
    <GalleryRoute
      element={
        <EthereumProviders>
          <SilverMembershipMintPage />
        </EthereumProviders>
      }
      navbar={false}
    />
  );
}

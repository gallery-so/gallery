import EthereumProviders from '~/contexts/auth/EthereumProviders';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import GoldMembershipMintPage from '~/scenes/MembershipMintPage/GoldMembershipMintPage';

export default function SilverMembership() {
  return (
    <GalleryRoute
      element={
        <EthereumProviders>
          <GoldMembershipMintPage />
        </EthereumProviders>
      }
      navbar={false}
    />
  );
}

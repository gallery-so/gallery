import EthereumProviders from '~/contexts/auth/EthereumProviders';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import MerchStorePage from '~/scenes/MerchStorePage/MerchStorePage';

export default function Privacy() {
  return (
    <GalleryRoute
      element={
        <EthereumProviders>
          <MerchStorePage />
        </EthereumProviders>
      }
      navbar={false}
    />
  );
}

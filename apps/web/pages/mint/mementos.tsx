import EthereumProviders from '~/contexts/auth/EthereumProviders';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import MementosPage from '~/scenes/MintPages/MementosPage';

export default function Mementos() {
  return (
    <GalleryRoute
      element={
        <EthereumProviders>
          <MementosPage />
        </EthereumProviders>
      }
      navbar={false}
      banner={false}
      footer={false}
    />
  );
}

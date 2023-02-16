import EthereumProviders from '~/contexts/auth/EthereumProviders';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import MementosPage from '~/scenes/MintPages/MementosPage';

export default function Mementos() {
  const isMobile = useIsMobileWindowWidth();

  return (
    <GalleryRoute
      element={
        <EthereumProviders>
          <MementosPage />
        </EthereumProviders>
      }
      navbar={false}
      banner={false}
      footer={!isMobile}
    />
  );
}

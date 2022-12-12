import EthereumProviders from '~/contexts/auth/EthereumProviders';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import ThankYouTokenPage from '~/scenes/MintPages/ThankYouTokenPage';

export default function ThankYouToken() {
  const isMobile = useIsMobileWindowWidth();

  return (
    <GalleryRoute
      element={
        <EthereumProviders>
          <ThankYouTokenPage />
        </EthereumProviders>
      }
      navbar={false}
      banner={false}
      footer={!isMobile}
    />
  );
}

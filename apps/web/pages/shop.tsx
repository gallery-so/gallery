import { graphql, useLazyLoadQuery } from 'react-relay';

import EthereumProviders from '~/contexts/auth/EthereumProviders';
import { shopQuery } from '~/generated/shopQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import MerchStorePage from '~/scenes/MerchStorePage/MerchStorePage';

export default function Shop() {
  const query = useLazyLoadQuery<shopQuery>(
    graphql`
      query shopQuery {
        ...MerchStorePageQueryFragment
      }
    `,
    {}
  );

  return (
    <GalleryRoute
      element={
        <EthereumProviders>
          <MerchStorePage queryRef={query} />
        </EthereumProviders>
      }
      navbar={false}
    />
  );
}

import { graphql, useLazyLoadQuery } from 'react-relay';

import { StandardSidebar } from '~/contexts/globalLayout/GlobalSidebar/StandardSidebar';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';

export default function Mobile() {
  const query = useLazyLoadQuery(
    graphql`
      query mobileQuery {
        ...StandardSidebarFragment
      }
    `,
    {}
  );
  return (
    <GalleryRoute
      element={<>dope mobile landing page</>}
      sidebar={<StandardSidebar queryRef={query} />}
      navbar={false}
      banner={false}
      footer={false}
    />
  );
}

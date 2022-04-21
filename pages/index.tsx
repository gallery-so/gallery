import { graphql, useLazyLoadQuery } from 'react-relay';
import HomeScene from 'scenes/Home/Home';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { pagesQuery } from '__generated__/pagesQuery.graphql';

export default function Index() {
  const query = useLazyLoadQuery<pagesQuery>(
    graphql`
      query pagesQuery {
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return (
    <GalleryRoute queryRef={query} element={<HomeScene />} navbar={false} footerVisibleOutOfView />
  );
}

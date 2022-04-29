import { graphql, useLazyLoadQuery } from 'react-relay';
import AuthScene from 'scenes/Auth/Auth';
import GalleryRoute from 'scenes/_Router/GalleryRoute';
import { authQuery } from '__generated__/authQuery.graphql';

export default function Auth() {
  const query = useLazyLoadQuery<authQuery>(
    graphql`
      query authQuery {
        ...AuthFragment
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return (
    <GalleryRoute
      queryRef={query}
      element={<AuthScene queryRef={query} />}
      navbar={false}
      banner={false}
      footerVisibleOutOfView
    />
  );
}

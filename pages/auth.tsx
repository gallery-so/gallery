import { graphql, useLazyLoadQuery } from 'react-relay';

import { authQuery } from '~/generated/authQuery.graphql';
import GalleryRoute from '~/scenes/_Router/GalleryRoute';
import AuthScene from '~/scenes/Auth/Auth';

export default function Auth() {
  const query = useLazyLoadQuery<authQuery>(
    graphql`
      query authQuery {
        ...AuthFragment
      }
    `,
    {}
  );

  return <GalleryRoute element={<AuthScene queryRef={query} />} navbar={false} />;
}

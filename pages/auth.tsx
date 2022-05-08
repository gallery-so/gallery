import { graphql, useLazyLoadQuery } from 'react-relay';
import AuthScene from 'scenes/Auth/Auth';
import GalleryV2Route from 'scenes/_Router/GalleryV2Route';
import { authQuery } from '__generated__/authQuery.graphql';

export default function Auth() {
  const query = useLazyLoadQuery<authQuery>(
    graphql`
      query authQuery {
        ...AuthFragment
      }
    `,
    {}
  );

  return <GalleryV2Route element={<AuthScene queryRef={query} />} navbar={false} />;
}

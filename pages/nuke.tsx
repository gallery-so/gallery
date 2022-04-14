import GalleryRoute from 'scenes/_Router/GalleryRoute';
import NukeScene from 'scenes/Nuke/Nuke';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { nukeQuery } from '__generated__/nukeQuery.graphql';

export default function Nuke() {
  const query = useLazyLoadQuery<nukeQuery>(
    graphql`
      query nukeQuery {
        ...GalleryRouteFragment
      }
    `,
    {}
  );

  return <GalleryRoute queryRef={query} element={<NukeScene />} navbar={false} />;
}

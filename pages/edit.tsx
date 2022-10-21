/**
 * This file exists strictly for backward compatability.
 *
 * Users that used to visit /edit directly will now be redirected
 * to `/gallery/{firstGalleryId}/edit`.
 *
 * This will better prepare us for multi gallery.
 */

import { graphql, useLazyLoadQuery } from 'react-relay';
import { editQuery } from '__generated__/editQuery.graphql';
import NotFound from 'scenes/NotFound/NotFound';
import GalleryRedirect from 'scenes/_Router/GalleryRedirect';

export default function Edit() {
  const query = useLazyLoadQuery<editQuery>(
    graphql`
      query editQuery {
        viewer {
          ... on Viewer {
            viewerGalleries {
              gallery {
                dbid
              }
            }
          }
        }
      }
    `,
    {}
  );

  const galleryId = query.viewer?.viewerGalleries?.[0]?.gallery?.dbid;

  if (!galleryId) {
    return <NotFound />;
  }

  return <GalleryRedirect to={`/gallery/${galleryId}/edit`} />;
}

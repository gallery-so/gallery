import { graphql, readInlineData } from 'relay-runtime';
import { getEditGalleryUrlFragment$key } from '../../__generated__/getEditGalleryUrlFragment.graphql';

export function getEditGalleryUrl(queryRef: getEditGalleryUrlFragment$key) {
  const query = readInlineData(
    graphql`
      fragment getEditGalleryUrlFragment on Query @inline {
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
    queryRef
  );

  const galleryId = query.viewer?.viewerGalleries?.[0]?.gallery?.dbid;
  if (galleryId) {
    return `/gallery/${galleryId}/edit`;
  } else {
    return null;
  }
}

import { Route } from 'nextjs-routes';
import { graphql, readInlineData } from 'relay-runtime';

import { getEditGalleryUrlFragment$key } from '~/generated/getEditGalleryUrlFragment.graphql';

export function getEditGalleryUrl(queryRef: getEditGalleryUrlFragment$key): Route | null {
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
    return {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId },
    };
  } else {
    return null;
  }
}

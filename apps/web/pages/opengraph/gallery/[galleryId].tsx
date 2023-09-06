import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { OpenGraphPreview } from '~/components/opengraph/OpenGraphPreview';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { GalleryIdOpengraphQuery } from '~/generated/GalleryIdOpengraphQuery.graphql';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export default function OpenGraphGalleryPage() {
  const { query } = useRouter();
  const queryResponse = useLazyLoadQuery<GalleryIdOpengraphQuery>(
    graphql`
      query GalleryIdOpengraphQuery($galleryId: DBID!) {
        gallery: galleryById(id: $galleryId) {
          ... on ErrGalleryNotFound {
            __typename
          }
          ... on Gallery {
            __typename

            name
            description
            collections {
              hidden
              tokens {
                token {
                  ...getPreviewImageUrlsInlineDangerouslyFragment
                }
              }
            }
          }
        }
      }
    `,
    { galleryId: query.galleryId as string }
  );

  if (queryResponse.gallery?.__typename !== 'Gallery') {
    return null;
  }

  const { gallery } = queryResponse;

  const imageUrls = removeNullValues(
    gallery?.collections
      ?.filter((collection) => !collection?.hidden)?.[0]
      ?.tokens?.map((element) => {
        if (element?.token) {
          const result = getPreviewImageUrlsInlineDangerously({ tokenRef: element.token });
          if (result.type === 'valid') {
            return result;
          }
          return null;
        }
      })
      .map((token) => token?.urls.large)
  ).slice(0, 4);

  const width = parseInt(query.width as string) || WIDTH_OPENGRAPH_IMAGE;
  const height = parseInt(query.height as string) || HEIGHT_OPENGRAPH_IMAGE;

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          <OpenGraphPreview
            title={gallery.name ?? ''}
            description={gallery.description ?? ''}
            imageUrls={imageUrls}
          />
        </div>
      </div>
      <style>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e7e5e4;
        }
        #opengraph-image {
          box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
        }
      `}</style>
    </>
  );
}

import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { OpenGraphPreview } from '~/components/opengraph/OpenGraphPreview';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { CollectionIdOpengraphQuery } from '~/generated/CollectionIdOpengraphQuery.graphql';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { removeNullValues } from '~/shared/relay/removeNullValues';

export default function OpenGraphCollectionPage() {
  const { query } = useRouter();
  const queryResponse = useLazyLoadQuery<CollectionIdOpengraphQuery>(
    graphql`
      query CollectionIdOpengraphQuery($collectionId: DBID!) {
        collection: collectionById(id: $collectionId) {
          ... on ErrCollectionNotFound {
            __typename
          }
          ... on Collection {
            __typename

            name
            collectorsNote
            tokens {
              token {
                ...getPreviewImageUrlsInlineDangerouslyFragment
              }
            }
          }
        }
      }
    `,
    { collectionId: query.collectionId as string }
  );

  if (queryResponse.collection?.__typename !== 'Collection') {
    return null;
  }

  const { collection } = queryResponse;

  const imageUrls = removeNullValues(
    removeNullValues(
      removeNullValues(collection.tokens).map(({ token }) => {
        if (token) {
          const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token });
          if (result.type === 'valid') {
            return result;
          }
          return null;
        }
      })
    )
      .slice(0, 4)
      .map((token) => token.urls.large)
  );

  const width = parseInt(query.width as string) || WIDTH_OPENGRAPH_IMAGE;
  const height = parseInt(query.height as string) || HEIGHT_OPENGRAPH_IMAGE;

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          <OpenGraphPreview
            title={collection.name ?? ''}
            description={collection.collectorsNote ?? ''}
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

import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { SingleOpenGraphPreview } from '~/components/opengraph/SingleOpenGraphPreview';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { TokenIdOpengraphQuery } from '~/generated/TokenIdOpengraphQuery.graphql';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';

export default function OpenGraphCollectionPage() {
  const { query } = useRouter();
  const queryResponse = useLazyLoadQuery<TokenIdOpengraphQuery>(
    graphql`
      query TokenIdOpengraphQuery($tokenId: DBID!) {
        token: tokenById(id: $tokenId) {
          ... on ErrTokenNotFound {
            __typename
          }
          ... on Token {
            __typename
            collectorsNote
            definition {
              name
              description
            }
            ...getPreviewImageUrlsInlineDangerouslyFragment
          }
        }
      }
    `,
    { tokenId: query.tokenId as string }
  );

  if (queryResponse.token?.__typename !== 'Token') {
    return null;
  }

  const { token } = queryResponse;

  const result = getPreviewImageUrlsInlineDangerously({ tokenRef: token });

  const width = parseInt(query.width as string) || WIDTH_OPENGRAPH_IMAGE;
  const height = parseInt(query.height as string) || HEIGHT_OPENGRAPH_IMAGE;

  if (result.type !== 'valid') {
    return null;
  }

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          {token && (
            <SingleOpenGraphPreview
              title={token.definition.name ?? ''}
              description={token.definition.description ?? ''}
              collectorsNote={token.collectorsNote ?? ''}
              imageUrls={result.urls.large ? [result.urls.large] : []}
            />
          )}
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

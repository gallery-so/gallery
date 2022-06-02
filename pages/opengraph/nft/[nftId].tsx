import { useRouter } from 'next/router';
import { OpenGraphPreview } from 'components/opengraph/OpenGraphPreview';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { NftIdOpengraphQuery } from '__generated__/NftIdOpengraphQuery.graphql';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';

export default function OpenGraphCollectionPage() {
  const { query } = useRouter();
  const queryResponse = useLazyLoadQuery<NftIdOpengraphQuery>(
    graphql`
      query NftIdOpengraphQuery($nftId: DBID!) {
        nft: tokenById(id: $nftId) {
          ... on ErrTokenNotFound {
            __typename
          }
          ... on Token {
            __typename

            name
            collectorsNote
            description
            ...getVideoOrImageUrlForNftPreviewFragment
          }
        }
      }
    `,
    { nftId: query.nftId as string }
  );

  if (queryResponse.nft?.__typename !== 'Nft') {
    return null;
  }

  const { nft } = queryResponse;

  const media = getVideoOrImageUrlForNftPreview(nft);

  const width = parseInt(query.width as string) || 600;
  const height = parseInt(query.height as string) || 300;

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          {nft && (
            <OpenGraphPreview
              title={nft.name ?? ''}
              description={(nft.collectorsNote || nft.description) ?? ''}
              imageUrls={media?.urls.large ? [media.urls.large] : []}
            />
          )}
        </div>
      </div>
      <style jsx>{`
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

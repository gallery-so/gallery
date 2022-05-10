import { useRouter } from 'next/router';
import { OpenGraphPreview } from 'components/opengraph/OpenGraphPreview';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { UsernameOpengraphQuery } from '__generated__/UsernameOpengraphQuery.graphql';
import getVideoOrImageUrlForNftPreview from 'utils/graphql/getVideoOrImageUrlForNftPreview';
import { removeNullValues } from 'utils/removeNullValues';

export default function OpenGraphUserPage() {
  const { query } = useRouter();
  const queryResponse = useLazyLoadQuery<UsernameOpengraphQuery>(
    graphql`
      query UsernameOpengraphQuery($username: String!) {
        user: userByUsername(username: $username) {
          ... on ErrUserNotFound {
            __typename
          }
          ... on ErrInvalidInput {
            __typename
          }
          ... on GalleryUser {
            __typename
            username
            bio
            galleries {
              collections {
                nfts {
                  nft {
                    ...getVideoOrImageUrlForNftPreviewFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    { username: query.username as string }
  );

  if (queryResponse.user?.__typename !== 'GalleryUser') {
    return null;
  }

  const { user } = queryResponse;

  const imageUrls = removeNullValues(
    user.galleries?.[0]?.collections
      ?.flatMap((collection) => collection?.nfts)
      .map((galleryNft) => {
        return galleryNft?.nft ? getVideoOrImageUrlForNftPreview(galleryNft.nft) : null;
      })
      .map((nft) => nft?.urls.large)
  ).slice(0, 4);

  const width = parseInt(query.width as string) || 600;
  const height = parseInt(query.height as string) || 300;

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          <OpenGraphPreview
            title={user.username ?? ''}
            description={user.bio ?? ''}
            imageUrls={imageUrls}
          />
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

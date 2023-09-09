import { useRouter } from 'next/router';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { OpenGraphPreview } from '~/components/opengraph/OpenGraphPreview';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { UsernameOpengraphQuery } from '~/generated/UsernameOpengraphQuery.graphql';
import { getPreviewImageUrlsInlineDangerously } from '~/shared/relay/getPreviewImageUrlsInlineDangerously';
import { removeNullValues } from '~/shared/relay/removeNullValues';

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
      }
    `,
    { username: query.username as string }
  );

  if (queryResponse.user?.__typename !== 'GalleryUser') {
    return null;
  }

  const { user } = queryResponse;

  const nonEmptyGalleries = user.galleries?.filter((gallery) =>
    gallery?.collections?.some((collection) => collection?.tokens?.length)
  );

  const imageUrls = removeNullValues(
    nonEmptyGalleries?.[0]?.collections
      ?.filter((collection) => !collection?.hidden)
      .flatMap((collection) => collection?.tokens)
      .map((galleryToken) => {
        return galleryToken?.token
          ? getPreviewImageUrlsInlineDangerously({ tokenRef: galleryToken.token })
          : null;
      })
      .map((result) => {
        if (result?.type === 'valid') {
          return result.urls.large;
        }
        return null;
      })
  ).slice(0, 4);

  const width = parseInt(query.width as string) || WIDTH_OPENGRAPH_IMAGE;
  const height = parseInt(query.height as string) || HEIGHT_OPENGRAPH_IMAGE;

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

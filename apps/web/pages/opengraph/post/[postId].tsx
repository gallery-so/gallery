import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { graphql, useLazyLoadQuery } from 'react-relay';

import { PostOpenGraphPreview } from '~/components/opengraph/PostOpenGraphPreview';
import { HEIGHT_OPENGRAPH_IMAGE, WIDTH_OPENGRAPH_IMAGE } from '~/constants/opengraph';
import { PostIdOpengraphQuery } from '~/generated/PostIdOpengraphQuery.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

export default function OpenGraphPostPage() {
  const { query } = useRouter();
  const queryResponse = useLazyLoadQuery<PostIdOpengraphQuery>(
    graphql`
      query PostIdOpengraphQuery($postId: DBID!) {
        post: postById(id: $postId) {
          ... on ErrPostNotFound {
            __typename
          }
          ... on Post {
            __typename
            author @required(action: THROW) {
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    ...getVideoOrImageUrlForNftPreviewFragment
                  }
                }
                ... on EnsProfileImage {
                  __typename
                  profileImage {
                    __typename
                    previewURLs {
                      medium
                    }
                  }
                }
              }
            }
            caption
            tokens {
              ...getVideoOrImageUrlForNftPreviewFragment
            }
          }
        }
      }
    `,
    { postId: query.postId as string }
  );
  const { post } = queryResponse;

  // stripped down version of the pfp retrieving logic in ProfilePicture.tsx
  const profileImageUrl = useMemo(() => {
    if (!post || post?.__typename !== 'Post') {
      return null;
    }

    const { token, profileImage } = post.author.profileImage ?? {};

    if (profileImage && profileImage.previewURLs?.medium) {
      return profileImage.previewURLs.medium;
    }

    if (token) {
      const result = getVideoOrImageUrlForNftPreview({
        tokenRef: token,
        handleReportError: reportError,
      });
      return result?.urls.small ?? null;
    }

    return null;
  }, [post]);

  if (post?.__typename !== 'Post') {
    return null;
  }

  const token = post?.tokens?.[0];
  const imageUrl = token ? getVideoOrImageUrlForNftPreview({ tokenRef: token })?.urls.large : null;

  const width = parseInt(query.width as string) || WIDTH_OPENGRAPH_IMAGE;
  const height = parseInt(query.height as string) || HEIGHT_OPENGRAPH_IMAGE;

  return (
    <>
      <div className="page">
        <div id="opengraph-image" style={{ width, height }}>
          <PostOpenGraphPreview
            username={post.author.username ?? ''}
            caption={post.caption ?? ''}
            imageUrl={imageUrl ?? ''}
            profileImageUrl={profileImageUrl ?? ''}
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

import { graphql, readInlineData } from 'relay-runtime';

import { getOptimisticUserInfoQueryFragment$key } from '~/generated/getOptimisticUserInfoQueryFragment.graphql';
import getVideoOrImageUrlForNftPreview from '~/shared/relay/getVideoOrImageUrlForNftPreview';

export type OptimisticUserInfo = {
  id: string;
  dbid: string;
  username: string;
  profileImageUrl: string;
};

export default function getOptimisticUserInfo(
  queryRef: getOptimisticUserInfoQueryFragment$key
): OptimisticUserInfo {
  const query = readInlineData(
    graphql`
      fragment getOptimisticUserInfoQueryFragment on Query @inline {
        viewer {
          ... on Viewer {
            user {
              id
              dbid
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    dbid
                    id
                    ...getVideoOrImageUrlForNftPreviewFragment
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const { token } = query.viewer?.user?.profileImage ?? {};
  const user = query.viewer?.user;
  if (!user) {
    return {
      id: '',
      dbid: '',
      username: '',
      profileImageUrl: '',
    };
  }

  const result = token
    ? getVideoOrImageUrlForNftPreview({
        tokenRef: token,
      })
    : null;

  return {
    id: user.id,
    dbid: user.dbid,
    username: user.username ?? '',
    profileImageUrl: result?.urls?.small ?? '',
  };
}

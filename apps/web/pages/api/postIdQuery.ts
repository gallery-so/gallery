export const postIdQuery = `query PostIdOpengraphQuery($postId: DBID!) {
post: postById(id: $postId) {
          ... on ErrPostNotFound {
            __typename
          }
          ... on Post {
            __typename
            author {
              username
              profileImage {
                ... on TokenProfileImage {
                  token {
                    dbid
                    
                  }
                }
              }
            }
            caption
            tokens {
              dbid
            }
          }
          
        }
      }
    `;

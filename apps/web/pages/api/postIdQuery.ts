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
                    definition {
                      media {
                        ... on ImageMedia {
                          __typename
                          previewURLs {
                            small
                            medium
                            large
                          }
                          fallbackMedia {
                            mediaURL
                          }
                        }
                        ... on VideoMedia {
                          __typename
                          previewURLs {
                            small
                            medium
                            large
                          }
                          fallbackMedia {
                            mediaURL
                          } 
                        }
                      }
                    }
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
              dbid
              definition {
                media {
                  ... on ImageMedia {
                    __typename
                    previewURLs {
                      small
                      medium
                      large
                    }
                    fallbackMedia {
                      mediaURL
                      }
                    }
                  ... on VideoMedia {
                    __typename
                    previewURLs {
                      small
                      medium
                      large
                    }
                      fallbackMedia {
                        mediaURL
                      }
                    }
                  }
                }
              }
            }
          }
        }
    `;

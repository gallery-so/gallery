import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { ViewerFeedQuery } from '__generated__/ViewerFeedQuery.graphql';

export default function ViewerFeed() {
  const query = useLazyLoadQuery<ViewerFeedQuery>(
    graphql`
      query ViewerFeedQuery($page: Pagination) {
        viewerFeed: viewerFeed(page: $page) {
          ... on Feed {
            events {
              dbid
              eventTime
              owner {
                dbid
              }
              action
            }
            pageInfo {
              hasNextPage
              size
              nextToken
            }
            viewer {
              user {
                dbid
              }
            }
          }
        }
      }
    `,
    {
      page: {
        limit: 10,
      },
    }
  );

  console.log('query', query);
  // const { feed } = useFragment(graphql`
  //   fragment ViewerFeedFragment on Query {
  //     viewerFeed: viewerFeed(page: 0) {
  //       ... on Feed {
  //         events
  //         pageInfo
  //         viewer
  //       }
  //     }
  //   }
  // `);
  return <StyledViewerFeed>Viewer</StyledViewerFeed>;
}

const StyledViewerFeed = styled.div``;

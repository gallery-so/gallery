import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';
import FeedEvent from './FeedEvent';

export default function GlobalFeed() {
  const pagination = {
    token: '2AvDaB5BSh1zcET8FYZS1fuiwFD',
  };
  const { globalFeed } = useLazyLoadQuery<GlobalFeedQuery>(
    graphql`
      query GlobalFeedQuery($page: Pagination) {
        globalFeed: globalFeed(page: $page) {
          ... on Feed {
            events {
              dbid
              eventTime
              owner {
                dbid
              }
              action

              ...FeedEventFragment
              ... on TokensAddedToCollectionEvent {
                newTokens {
                  token {
                    dbid
                  }
                }
                collection {
                  name
                }
              }
            }
            pageInfo {
              hasNextPage
              size
              nextToken
            }
          }
        }
      }
    `,
    {
      page: pagination,
    }
  );
  console.log('globalFeed', globalFeed);
  return (
    <StyledGlobalFeed>
      {globalFeed.events.map((event) => (
        <FeedEvent queryRef={event} key={event.dbid} />
      ))}
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

import Spacer from 'components/core/Spacer/Spacer';
import { graphql, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { GlobalFeedQuery } from '__generated__/GlobalFeedQuery.graphql';
import FeedEvent from './FeedEvent';

export default function GlobalFeed() {
  const pagination = {
    // token: '2AyjfivgDr915AvmMsIqPR5Q1BB'
    // limit: 4,
  };
  const { globalFeed } = useLazyLoadQuery<GlobalFeedQuery>(
    graphql`
      query GlobalFeedQuery($page: Pagination) {
        globalFeed: globalFeed(page: $page) {
          ... on Feed {
            events {
              dbid

              ...FeedEventFragment
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
  // if hasNextPage show button
  return (
    <StyledGlobalFeed>
      {globalFeed.events.map((event) => (
        <>
          <FeedEvent queryRef={event} key={event.dbid} />
          <Spacer height={12} />
        </>
      ))}
    </StyledGlobalFeed>
  );
}

const StyledGlobalFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

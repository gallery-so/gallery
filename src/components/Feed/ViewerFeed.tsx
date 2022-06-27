import Spacer from 'components/core/Spacer/Spacer';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';
import { ViewerFeedQuery } from '__generated__/ViewerFeedQuery.graphql';
import FeedEvent from './FeedEvent';

export default function ViewerFeed() {
  const pagination = {
    // token: '2AyjfivgDr915AvmMsIqPR5Q1BB'
    // limit: 4,
  };
  // const { viewerFeed } = useLazyLoadQuery<ViewerFeedQuery>(
  //   graphql`
  //     query ViewerFeedQuery($page: Pagination) {
  //       viewerFeed: viewerFeed(page: $page) {
  //         ... on Feed {
  //           events {
  //             dbid
  //             ...FeedEventFragment
  //           }
  //           pageInfo {
  //             hasNextPage
  //             size
  //             nextToken
  //           }
  //           viewer {
  //             user {
  //               dbid
  //             }
  //           }
  //         }
  //       }
  //     }
  //   `,
  //   {
  //     page: pagination,
  //   }
  // );

  // console.log('viewerFeed', viewerFeed);
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
  return (
    <StyledViewerFeed>
      {/* {viewerFeed.events.map((event) => (
        <>
          <FeedEvent queryRef={event} key={event.dbid} />
          <Spacer height={12} />
        </>
      ))} */}
    </StyledViewerFeed>
  );
}

const StyledViewerFeed = styled.div`
  display: flex;
  flex-direction: column;
`;

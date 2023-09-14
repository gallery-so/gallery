import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchQuery, graphql, useFragment, useRelayEnvironment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { PostItem } from '~/components/Feed/PostItem';
import useWindowSize from '~/hooks/useWindowSize';

import { fetchPageQuery } from '../CommunityPagePresentationPosts';

const NEXT_POST_INTERVAL_MS = 10000;
const CHECK_HAS_NEXT_PAGE_INTERVAL_MS = 5000;

type Props = {
  postsRef: any;
  queryRef: any;
  pageInfoRef: any;
  loadNext: (count: number) => void;
};

export default function CommunityPagePresentationPostsCycle({
  postsRef,
  queryRef,
  pageInfoRef,
  loadNext,
}: Props) {
  const posts = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsCycleFragment on Post @relay(plural: true) {
        ...CommunityPagePresentationPostsCyclePostFragment
      }
    `,
    postsRef
  );

  const pageInfo = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsCyclePageInfoFragment on PageInfo {
        hasNextPage
        endCursor
      }
    `,
    pageInfoRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsCycleQueryFragment on Query {
        ...CommunityPagePresentationPostsCyclePostQueryFragment
      }
    `,
    queryRef
  );

  const [hasNextPage, setHasNextPage] = useState(false);

  const relayEnvironment = useRelayEnvironment();

  // pageinfo gets updated when we load next, for some reason it's behind one

  // getting posts after endcursor, not current one: bug
  // we're querying for after DwEAAAAO3JN/tR/oC4gAABsyVkt6MjZUS3hGZUJSSTlFVnhOTXM1OXh3d3k"
  // its responding with "DwEAAAAO3JN/0QsML6AAABsyVkt6NWZDem94bk53dUIyVDNlcTRGVWFjRzQ"
  // response is saying there's no next page after the next result
  //

  const refreshPageInfo = useCallback(async () => {
    console.log('checking has next page!!!', pageInfo.endCursor);
    const data = await fetchQuery(relayEnvironment, fetchPageQuery, {
      communityAddress: {
        address: '0x7e619a01e1a3b3a6526d0e01fbac4822d48f439b',
        chain: 'ethereum',
      },
      communityPostsAfter: pageInfo.endCursor,
      communityPostsFirst: 1,
      forceRefresh: false,
    }).toPromise();

    console.log('next page', { data });

    const hasNextPage = Boolean(data.community?.postsPageInfo?.pageInfo?.endCursor);
    console.log('REFRESHED: ', hasNextPage);
    setHasNextPage(hasNextPage);

    // setHasNextPage(hasNextPage);
  }, [pageInfo.endCursor, relayEnvironment]);

  const [intervalCount, setIntervalCount] = useState(0);
  const [pollingIntervalCount, setPollingIntervalCount] = useState(0);
  const [displayedPostIndex, setDisplayedPostIndex] = useState(0);

  // Polling effect
  // Poll to check if there is a next page.
  useEffect(() => {
    console.log('polling for hasNextPage');
    if (!hasNextPage) {
      console.log('hasNextPage is false, so refetch');
      refreshPageInfo();

      // refetch({}, { fetchPolicy: 'network-only' });
    } else {
      console.log("hasNextPage is true, so don't refetch");
    }
  }, [pollingIntervalCount]);

  // This Effect increments the interval count every 5 seconds.
  // The interval count triggers other effects so we can do other things every 5 seconds.
  // We can't directly do things from inside the setInterval because it doesn't have access to the latest state.
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log('increment');
      setIntervalCount((prevCount) => prevCount + 1);
    }, NEXT_POST_INTERVAL_MS);

    const pollingIntervalId = setInterval(() => {
      setPollingIntervalCount((prevCount) => prevCount + 1);
    }, CHECK_HAS_NEXT_PAGE_INTERVAL_MS);

    return () => {
      console.log('clear');
      clearInterval(intervalId);
      clearInterval(pollingIntervalId);
    };
  }, []);

  // every interval, we need to load next if next page, or reset to first post if no next page
  useEffect(() => {
    console.log('interval');
    if (intervalCount === 0) {
      return;
    }
    // console.log('intervalCount change', ' now load if next page, or reset to first post');
    if (hasNextPage) {
      console.log('Interval change: hasNextPage, so load next post');
      setHasNextPage(false);
      loadNext(1);
    } else {
      console.log('Interval change: no hasNextPage, so cycle through loaded posts');
      setDisplayedPostIndex((prevIndex) => {
        if (prevIndex >= posts.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }
  }, [intervalCount]);

  // if posts.length changes, it means we fetched another post.
  // so show the latest post
  useEffect(() => {
    console.log('updating index!', { posts }, posts.length - 1);
    setDisplayedPostIndex(posts.length - 1);
  }, [posts.length]);

  return (
    <VStack>
      hello
      <div>index: {displayedPostIndex}</div>
      <div>id: {posts[displayedPostIndex]?.id}</div>
      <PresentationPost postRef={posts[displayedPostIndex]} queryRef={query} />
    </VStack>
  );
}

type PostProps = {
  postRef: any;
  queryRef: any;
};

const POST_WIDTH_PX = 544; // incl 32px of padding
function PresentationPost({ postRef, queryRef }: PostProps) {
  const { width } = useWindowSize();
  //   // Scale post to fit screen size, so we don't have to manually resize the post's elements
  const scale = width / POST_WIDTH_PX;

  const post = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsCyclePostFragment on Post {
        ...PostItemFragment
      }
    `,
    postRef
  );

  // console.log({ post });
  const query = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsCyclePostQueryFragment on Query {
        ...PostItemQueryFragment
      }
    `,
    queryRef
  );

  // console.log({ query });

  return (
    <ScaledPost scale={scale}>
      {/* <StyledDiv> */}
      <PostItem eventRef={post} queryRef={query} bigScreenMode={true} />
      {/* </StyledDiv> */}
    </ScaledPost>
  );
}

// const StyledDiv = styled.div`
//   margin: 0 32px;
// `;

const ScaledPost = styled.div<{ scale: number }>`
  width: ${POST_WIDTH_PX}px;
  transform: scale(${({ scale }) => scale});
  transform-origin: top left;
`;

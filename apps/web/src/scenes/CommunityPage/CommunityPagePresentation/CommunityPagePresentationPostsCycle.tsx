import { useCallback, useEffect, useState } from 'react';
import { fetchQuery, graphql, useFragment, useRelayEnvironment } from 'react-relay';
import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { PostItem } from '~/components/Feed/PostItem';
import { CommunityPagePresentationPostsCycleFragment$key } from '~/generated/CommunityPagePresentationPostsCycleFragment.graphql';
import { CommunityPagePresentationPostsCyclePageInfoFragment$key } from '~/generated/CommunityPagePresentationPostsCyclePageInfoFragment.graphql';
import { CommunityPagePresentationPostsCyclePostFragment$key } from '~/generated/CommunityPagePresentationPostsCyclePostFragment.graphql';
import { CommunityPagePresentationPostsCyclePostQueryFragment$key } from '~/generated/CommunityPagePresentationPostsCyclePostQueryFragment.graphql';
import { CommunityPagePresentationPostsCycleQueryFragment$key } from '~/generated/CommunityPagePresentationPostsCycleQueryFragment.graphql';
import { CommunityPagePresentationPostsHasNextPageQuery } from '~/generated/CommunityPagePresentationPostsHasNextPageQuery.graphql';
import useWindowSize from '~/hooks/useWindowSize';

import { fetchPageQuery } from './CommunityPagePresentationPosts';

const NEXT_POST_INTERVAL_MS = 100000;
const CHECK_HAS_NEXT_PAGE_INTERVAL_MS = 50000;

type Props = {
  postsRef: CommunityPagePresentationPostsCycleFragment$key;
  queryRef: CommunityPagePresentationPostsCycleQueryFragment$key;
  pageInfoRef: CommunityPagePresentationPostsCyclePageInfoFragment$key;
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

  const refreshPageInfo = useCallback(async () => {
    const data = await fetchQuery<CommunityPagePresentationPostsHasNextPageQuery>(
      relayEnvironment,
      fetchPageQuery,
      {
        communityAddress: {
          address: '0x7e619a01e1a3b3a6526d0e01fbac4822d48f439b',
          chain: 'Ethereum',
        },
        communityPostsAfter: pageInfo.endCursor,
        communityPostsFirst: 1,
        forceRefresh: false,
      }
    ).toPromise();

    if (data?.community?.__typename !== 'Community') {
      return;
    }

    const hasNextPage = Boolean(data?.community?.postsPageInfo?.pageInfo?.endCursor);
    console.log('Refreshed Page Info, next Post found: ', hasNextPage);
    setHasNextPage(hasNextPage);
  }, [pageInfo.endCursor, relayEnvironment]);

  // This page is controlled by 2 separate interval states:
  // 1. rotatePostIntervalCount is used to cycle through posts being displayed.
  // 2. pollNextIntervalCount is used to check if there is a next page with a Post that we can fetch.
  // We use 2 separate intervals because we want to poll for the next page at a faster rate than we cycle through posts.
  // We use state to trigger logic at intervals because we can't directly do things from inside the setInterval because it doesn't have access to the latest state.

  // both states are incremented by 1 every interval (NEXT_POST_INTERVAL_MS and CHECK_HAS_NEXT_PAGE_INTERVAL_MS respectively)
  // each time these states change, they trigger effects that are defined below.
  const [rotatePostIntervalCount, setRotatePostIntervalCount] = useState(0);
  const [pollNextIntervalCount, setPollNextPostIntervalCount] = useState(0);

  //
  const [displayedPostIndex, setDisplayedPostIndex] = useState(0);

  // Kick off the intervals to update state every x seconds - basically the "clocks" of this page
  useEffect(() => {
    const rotatePostIntervalId = setInterval(() => {
      setRotatePostIntervalCount((prevCount) => prevCount + 1);
    }, NEXT_POST_INTERVAL_MS);

    const pollingIntervalId = setInterval(() => {
      setPollNextPostIntervalCount((prevCount) => prevCount + 1);
    }, CHECK_HAS_NEXT_PAGE_INTERVAL_MS);

    return () => {
      clearInterval(rotatePostIntervalId);
      clearInterval(pollingIntervalId);
    };
  }, []);

  // Poll to check if there is a next Post we can fetch. this should run every CHECK_HAS_NEXT_PAGE_INTERVAL_MS
  useEffect(() => {
    if (!hasNextPage) {
      console.log('Refreshing Page Info to see if there is a next Post');
      refreshPageInfo();
    } else {
      console.log("We know there's a next Post already, so don't refresh Page Info");
    }
    // limit dependencies. we specifically want to run this effect only when pollingIntervcalCount changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pollNextIntervalCount]);

  // Change the post being displayed. If we know there's another Post we can load, load it. Otherwise, cycle through the posts we already have loaded.
  // If we know there's another Post we , or reset to first post if no next page. This should run every NEXT_POST_INTERVAL_MS
  useEffect(() => {
    if (rotatePostIntervalCount === 0) {
      // ignore the first interval change since we display the first post by default
      return;
    }

    if (hasNextPage) {
      console.log('Interval change: hasNextPage, so load next post');
      setHasNextPage(false);
      loadNext(1);
    } else {
      console.log('Interval change: no hasNextPage, so cycle through loaded posts');
      setDisplayedPostIndex((prevIndex) => {
        // if we're at the last post, reset to first post. otherwise show the next one. this lets us infinitely cycle through all the posts we've loaded already
        if (prevIndex >= posts.length - 1) {
          return 0;
        }
        return prevIndex + 1;
      });
    }
    // limit dependencies. we specifically want to run this effect only when rotatePostIntervalCount changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotatePostIntervalCount]);

  // Whenever we load a new Post (which changes posts.length) display it so we don't have to cycle through all the old Posts to show the new one.
  useEffect(() => {
    console.log('Loaded new post, displaying it now');
    setDisplayedPostIndex(posts.length - 1);
    // Limit dependencies, we specifically want to run this effect only when posts.length changes which most likely means we fetched another Post.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length]);

  const post = posts[displayedPostIndex];

  if (!post) {
    return null;
  }

  return (
    <VStack>
      <PresentationPost postRef={post} queryRef={query} />
    </VStack>
  );
}

type PostProps = {
  postRef: CommunityPagePresentationPostsCyclePostFragment$key;
  queryRef: CommunityPagePresentationPostsCyclePostQueryFragment$key;
};

// can use DESKTOP_TOKEN_SIZE
const POST_WIDTH_PX = 517; // incl 32px of padding
const MARGIN = 32;

function PresentationPost({ postRef, queryRef }: PostProps) {
  const { width } = useWindowSize();
  //   // Scale post to fit screen size, so we don't have to manually resize the post's elements
  const scale = width / (POST_WIDTH_PX + MARGIN);

  const post = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsCyclePostFragment on Post {
        ...PostItemFragment
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment CommunityPagePresentationPostsCyclePostQueryFragment on Query {
        ...PostItemQueryFragment
      }
    `,
    queryRef
  );

  return (
    <ScaledPost scale={scale}>
      <PostItem eventRef={post} queryRef={query} bigScreenMode={true} />
    </ScaledPost>
  );
}

const ScaledPost = styled.div<{ scale: number }>`
  width: ${POST_WIDTH_PX}px;
  transform: scale(${({ scale }) => scale});
  transform-origin: top left;
  margin: 0 ${MARGIN * 2}px;
`;

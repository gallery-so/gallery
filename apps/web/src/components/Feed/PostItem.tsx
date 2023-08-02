import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { FeedEventData } from '~/components/Feed/FeedEventData';
import { FeedEventSocializeSection } from '~/components/Feed/Socialize/FeedEventSocializeSection';
import { FeedMode } from '~/components/Feed/types';
import { FeedItemFragment$key } from '~/generated/FeedItemFragment.graphql';
import { FeedItemQueryFragment$key } from '~/generated/FeedItemQueryFragment.graphql';
import { FeedItemWithErrorBoundaryFragment$key } from '~/generated/FeedItemWithErrorBoundaryFragment.graphql';
import { FeedItemWithErrorBoundaryQueryFragment$key } from '~/generated/FeedItemWithErrorBoundaryQueryFragment.graphql';
import { PostItemFragment$key } from '~/generated/PostItemFragment.graphql';
import { PostItemQueryFragment$key } from '~/generated/PostItemQueryFragment.graphql';
import { PostItemWithErrorBoundaryFragment$key } from '~/generated/PostItemWithErrorBoundaryFragment.graphql';
import { PostItemWithErrorBoundaryQueryFragment$key } from '~/generated/PostItemWithErrorBoundaryQueryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';
import { TriedToRenderUnsupportedFeedEvent } from '~/shared/errors/TriedToRenderUnsupportedFeedEvent';

import PostData from './Posts/PostData';
import PostHeader from './Posts/PostHeader';
import PostNfts from './Posts/PostNfts';
import PostSocializeSection from './Socialize/PostSocializeSection';

type PostItemProps = {
  eventRef: PostItemFragment$key;
  queryRef: PostItemQueryFragment$key;
  handlePotentialLayoutShift: () => void;
  index: number;
};

// Not to be confused with the FeedEvent type. This component can render both FeedEvent and Post types, and represents a single item in the feed.
function PostItem({ eventRef, queryRef, handlePotentialLayoutShift, index }: PostItemProps) {
  const post = useFragment(
    graphql`
      fragment PostItemFragment on Post {
        __typename
        ...PostDataFragment
        ...PostSocializeSectionFragment
        ...PostHeaderFragment
        ...PostNftsFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment PostItemQueryFragment on Query {
        ...PostDataQueryFragment
        ...PostSocializeSectionQueryFragment
        ...PostHeaderQueryFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  if (isMobile) {
    return (
      <StyledPostItem gap={12}>
        <PostHeader postRef={post} queryRef={query} />
        <PostNfts postRef={post} />
        {/* // We have another boundary here in case the socialize section fails
          // and the rest of the post loads */}

        <ReportingErrorBoundary dontReport fallback={<></>}>
          <PostSocializeSection
            queryRef={query}
            postRef={post}
            onPotentialLayoutShift={handlePotentialLayoutShift}
          />
        </ReportingErrorBoundary>
      </StyledPostItem>
    );
  }
  return (
    <StyledPostItem>
      <PostNfts postRef={post} />
      {/* {index % 2 === 0 && <PostNfts postRef={post} />} */}
      <StyledDesktopPostData gap={16} justify="space-between">
        <PostHeader postRef={post} queryRef={query} />
        <ReportingErrorBoundary dontReport fallback={<></>}>
          <PostSocializeSection
            queryRef={query}
            postRef={post}
            onPotentialLayoutShift={handlePotentialLayoutShift}
          />
        </ReportingErrorBoundary>
      </StyledDesktopPostData>
      {/* {index % 2 === 1 && <PostNfts postRef={post} />} */}
    </StyledPostItem>
  );
}

const StyledPostItem = styled.div`
  max-height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  @media only screen and ${breakpoints.desktop} {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const StyledDesktopPostData = styled(VStack)`
  // padding: 24px;
  width: 380px;
`;

type PostItemWithBoundaryProps = {
  index: number;
  feedMode: FeedMode;
  onPotentialLayoutShift: (index: number) => void;
  eventRef: PostItemWithErrorBoundaryFragment$key;
  queryRef: PostItemWithErrorBoundaryQueryFragment$key;
};

export default function PostItemWithBoundary({
  index,
  feedMode,
  eventRef,
  queryRef,
  onPotentialLayoutShift,
}: PostItemWithBoundaryProps) {
  const event = useFragment(
    graphql`
      fragment PostItemWithErrorBoundaryFragment on Post {
        ...PostItemFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment PostItemWithErrorBoundaryQueryFragment on Query {
        ...PostItemQueryFragment
      }
    `,
    queryRef
  );

  // const shouldShowAdmireComment = event.eventData?.__typename !== 'UserFollowedUsersFeedEventData';
  const handlePotentialLayoutShift = useCallback(() => {
    onPotentialLayoutShift(index);
  }, [index, onPotentialLayoutShift]);
  return (
    <ReportingErrorBoundary fallback={<></>}>
      <PostItemContainer gap={16}>
        <PostItem
          eventRef={event}
          queryRef={query}
          handlePotentialLayoutShift={handlePotentialLayoutShift}
          index={index}
        />
      </PostItemContainer>
    </ReportingErrorBoundary>
  );
}

const PostItemContainer = styled(VStack)`
  margin: 0 auto;

  padding: 24px 0px;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;

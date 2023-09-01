import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { PostItemFragment$key } from '~/generated/PostItemFragment.graphql';
import { PostItemQueryFragment$key } from '~/generated/PostItemQueryFragment.graphql';
import { PostItemWithErrorBoundaryFragment$key } from '~/generated/PostItemWithErrorBoundaryFragment.graphql';
import { PostItemWithErrorBoundaryQueryFragment$key } from '~/generated/PostItemWithErrorBoundaryQueryFragment.graphql';
import { useIsDesktopWindowWidth } from '~/hooks/useWindowSize';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import PostCommunityPill from './Posts/PostCommunityPill';
import PostHeader from './Posts/PostHeader';
import PostNfts from './Posts/PostNfts';
import PostSocializeSection from './Socialize/PostSocializeSection';

type PostItemProps = {
  eventRef: PostItemFragment$key;
  queryRef: PostItemQueryFragment$key;
  handlePotentialLayoutShift?: () => void;
  measure?: () => void;
};

export function PostItem({
  eventRef,
  queryRef,
  handlePotentialLayoutShift,

  measure,
}: PostItemProps) {
  const post = useFragment(
    graphql`
      fragment PostItemFragment on Post {
        ...PostSocializeSectionFragment
        ...PostHeaderFragment
        ...PostNftsFragment
        ...PostCommunityPillFragment
      }
    `,
    eventRef
  );

  const query = useFragment(
    graphql`
      fragment PostItemQueryFragment on Query {
        ...PostSocializeSectionQueryFragment
        ...PostHeaderQueryFragment
      }
    `,
    queryRef
  );

  const isDesktop = useIsDesktopWindowWidth();

  if (!isDesktop) {
    return (
      <StyledPostItem>
        <PostHeader postRef={post} queryRef={query} />
        <PostNfts postRef={post} onNftLoad={measure} />
        <VStack gap={8}>
          <PostCommunityPill postRef={post} />
          <ReportingErrorBoundary dontReport fallback={<></>}>
            <PostSocializeSection
              queryRef={query}
              postRef={post}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          </ReportingErrorBoundary>
        </VStack>
      </StyledPostItem>
    );
  }
  return (
    <StyledPostItem>
      <PostNfts postRef={post} onNftLoad={measure} />
      <StyledDesktopPostData gap={16} justify="space-between">
        <PostHeader postRef={post} queryRef={query} />
        <VStack gap={8}>
          <PostCommunityPill postRef={post} />
          <ReportingErrorBoundary dontReport fallback={<></>}>
            <PostSocializeSection
              queryRef={query}
              postRef={post}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          </ReportingErrorBoundary>
        </VStack>
      </StyledDesktopPostData>
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
  padding: 24px;
  width: 380px;
`;

type PostItemWithBoundaryProps = {
  index: number;
  onPotentialLayoutShift: (index: number) => void;
  eventRef: PostItemWithErrorBoundaryFragment$key;
  queryRef: PostItemWithErrorBoundaryQueryFragment$key;
  measure: () => void;
};

export function PostItemWithBoundary({
  index,
  eventRef,
  queryRef,
  onPotentialLayoutShift,
  measure,
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
          measure={measure}
        />
      </PostItemContainer>
    </ReportingErrorBoundary>
  );
}

const PostItemContainer = styled(VStack)`
  margin: 8px auto;

  padding: 12px 0px;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;

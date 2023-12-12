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
import { contexts } from '~/shared/analytics/constants';
import { ErrorWithSentryMetadata } from '~/shared/errors/ErrorWithSentryMetadata';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

import { MintLinkButton } from '../MintLinkButton';
import { PostCreatorAndCollectionSection } from './Posts/PostCreatorAndCollectionSection';
import PostHeader from './Posts/PostHeader';
import PostNfts from './Posts/PostNfts';
import PostSocializeSection from './Socialize/PostSocializeSection';

type PostItemProps = {
  eventRef: PostItemFragment$key;
  queryRef: PostItemQueryFragment$key;
  handlePotentialLayoutShift?: () => void;
  measure?: () => void;
  bigScreenMode?: boolean;
};

export function PostItem({
  eventRef,
  queryRef,
  handlePotentialLayoutShift,
  measure,
  bigScreenMode = false,
}: PostItemProps) {
  const post = useFragment(
    graphql`
      fragment PostItemFragment on Post {
        dbid
        userAddedMintURL
        author {
          __typename
        }
        tokens {
          ...PostCreatorAndCollectionSectionFragment
          ...MintLinkButtonFragment
        }
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
        ...PostSocializeSectionQueryFragment
        ...PostHeaderQueryFragment
      }
    `,
    queryRef
  );

  const isDesktop = useIsDesktopWindowWidth();

  const useVerticalLayout = !isDesktop || bigScreenMode;
  const userAddedMintURL = post?.userAddedMintURL ?? '';

  const token = post.tokens?.[0];

  if (!token) {
    throw new Error('No token provided with post');
  }

  if (!post.author) {
    throw new ErrorWithSentryMetadata('Post author is undefined', { postId: post.dbid }); // no need to specify `tags`
  }

  if (useVerticalLayout) {
    return (
      <StyledPostItem useVerticalLayout={true}>
        <PostHeader postRef={post} queryRef={query} />
        <PostNfts postRef={post} onNftLoad={measure} />
        <VStack gap={8}>
          <PostCreatorAndCollectionSection tokenRef={token} />
          <ReportingErrorBoundary dontReport fallback={<></>}>
            <PostSocializeSection
              queryRef={query}
              postRef={post}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          </ReportingErrorBoundary>
          <MintLinkButton
            tokenRef={token}
            overwriteURL={userAddedMintURL}
            eventElementId="Click Mint Link Button"
            eventName="Click Mint Link Button"
            eventContext={contexts.Feed}
            variant="secondary"
          />
        </VStack>
      </StyledPostItem>
    );
  }
  return (
    <StyledPostItem useVerticalLayout={false}>
      <PostNfts postRef={post} onNftLoad={measure} />
      <StyledDesktopPostData gap={16} justify="space-between">
        <PostHeader postRef={post} queryRef={query} />
        <VStack gap={8}>
          <PostCreatorAndCollectionSection tokenRef={token} />
          <ReportingErrorBoundary dontReport fallback={<></>}>
            <PostSocializeSection
              queryRef={query}
              postRef={post}
              onPotentialLayoutShift={handlePotentialLayoutShift}
            />
          </ReportingErrorBoundary>
          <MintLinkButton
            tokenRef={token}
            overwriteURL={userAddedMintURL}
            eventElementId="Click Mint Link Button"
            eventName="Click Mint Link Button"
            eventContext={contexts.Feed}
          />
        </VStack>
      </StyledDesktopPostData>
    </StyledPostItem>
  );
}

const StyledPostItem = styled.div<{ useVerticalLayout: boolean }>`
  max-height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  max-width: 1024px;

  ${({ useVerticalLayout }) =>
    !useVerticalLayout &&
    `
    flex-direction: row;
    justify-content: space-between;
  `}
`;

const StyledDesktopPostData = styled(VStack)`
  padding: 24px;
  width: 380px;
`;

type PostItemWithBoundaryProps = {
  index: number;
  onPotentialLayoutShift?: (index: number) => void;
  eventRef: PostItemWithErrorBoundaryFragment$key;
  queryRef: PostItemWithErrorBoundaryQueryFragment$key;
  measure: () => void;
  bigScreenMode?: boolean;
};

export function PostItemWithBoundary({
  index,
  eventRef,
  queryRef,
  onPotentialLayoutShift,
  measure,
  bigScreenMode = false,
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
    if (onPotentialLayoutShift) {
      // onPotentialLayoutShift is only defined when displaying Posts in a virtualized setting
      onPotentialLayoutShift(index);
    }
  }, [index, onPotentialLayoutShift]);
  return (
    <ReportingErrorBoundary fallback={<></>}>
      <PostItemContainer gap={16} bigScreenMode={bigScreenMode}>
        <PostItem
          eventRef={event}
          queryRef={query}
          handlePotentialLayoutShift={handlePotentialLayoutShift}
          measure={measure}
          bigScreenMode={bigScreenMode}
        />
      </PostItemContainer>
    </ReportingErrorBoundary>
  );
}

const PostItemContainer = styled(VStack)<{ bigScreenMode: boolean }>`
  margin: 8px auto;

  padding: 12px 0px;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${({ bigScreenMode }) => (bigScreenMode ? 544 : FEED_EVENT_ROW_WIDTH_DESKTOP)}px;
  }
`;

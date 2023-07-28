import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import PostData from '~/components/Feed/Posts/PostData';
import PostSocializeSection from '~/components/Feed/Socialize/PostSocializeSection';
import { StandalonePostViewFragment$key } from '~/generated/StandalonePostViewFragment.graphql';
import { StandalonePostViewQueryFragment$key } from '~/generated/StandalonePostViewQueryFragment.graphql';
import { ReportingErrorBoundary } from '~/shared/errors/ReportingErrorBoundary';

type Props = {
  postRef: StandalonePostViewFragment$key;
  queryRef: StandalonePostViewQueryFragment$key;
};

export default function StandalonePostView({ postRef, queryRef }: Props) {
  const post = useFragment(
    graphql`
      fragment StandalonePostViewFragment on Post {
        ...PostDataFragment
        ...PostSocializeSectionFragment
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment StandalonePostViewQueryFragment on Query {
        ...PostSocializeSectionQueryFragment
        ...PostDataQueryFragment
      }
    `,
    queryRef
  );

  return (
    <ReportingErrorBoundary fallback={<></>}>
      <StyledPostContainer gap={16}>
        <PostData postRef={post} queryRef={query} />

        {/* // We have another boundary here in case the socialize section fails
      // and the rest of the feed event loads */}
        <ReportingErrorBoundary dontReport fallback={<></>}>
          <PostSocializeSection queryRef={query} postRef={post} />
        </ReportingErrorBoundary>
      </StyledPostContainer>
    </ReportingErrorBoundary>
  );
}

const StyledPostContainer = styled(VStack)`
  margin: 0 auto;

  padding: 24px 0px;

  @media only screen and ${breakpoints.desktop} {
    padding: 24px 16px;
    max-width: initial;
    width: ${FEED_EVENT_ROW_WIDTH_DESKTOP}px;
  }
`;

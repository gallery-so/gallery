import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { VStack } from '~/components/core/Spacer/Stack';
import { FEED_EVENT_ROW_WIDTH_DESKTOP } from '~/components/Feed/dimensions';
import { PostItem } from '~/components/Feed/PostItem';
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
        ...PostItemFragment
      }
    `,
    postRef
  );

  const query = useFragment(
    graphql`
      fragment StandalonePostViewQueryFragment on Query {
        ...PostItemQueryFragment
      }
    `,
    queryRef
  );

  return (
    <ReportingErrorBoundary fallback={<></>}>
      <StyledPostContainer gap={16}>
        <PostItem eventRef={post} queryRef={query} />
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

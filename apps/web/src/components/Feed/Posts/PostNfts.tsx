import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { PostNftsFragment$key } from '~/generated/PostNftsFragment.graphql';
import useWindowSize, { useBreakpoint } from '~/hooks/useWindowSize';
import colors from '~/shared/theme/colors';

import { getFeedTokenDimensions } from '../dimensions';
import PostNftPreview from './PostNftPreview';

type Props = {
  postRef: PostNftsFragment$key;
};

export default function PostNfts({ postRef }: Props) {
  const post = useFragment(
    graphql`
      fragment PostNftsFragment on Post {
        __typename
        dbid
        tokens {
          ...PostNftPreviewFragment
        }
      }
    `,
    postRef
  );

  const breakpoint = useBreakpoint();
  const { width } = useWindowSize();

  const tokenSize = useMemo(() => {
    return getFeedTokenDimensions({
      numTokens: '1',
      maxWidth: width,
      breakpoint,
    });
  }, [breakpoint, width]);

  if (!post.tokens) {
    reportError(`PostData: post.tokens is null - ${post.dbid}`);
  }

  const token = post.tokens && post.tokens[0];
  return (
    <StyledTokenContainer justify="center" align="center">
      {token ? (
        <PostNftPreview tokenRef={token} tokenSize={tokenSize} />
      ) : (
        <BaseM color={colors.shadow}>There was an error displaying this item</BaseM>
      )}
    </StyledTokenContainer>
  );
}

const StyledTokenContainer = styled(HStack)`
  padding: 24px;
`;

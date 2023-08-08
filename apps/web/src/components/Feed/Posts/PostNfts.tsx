import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM } from '~/components/core/Text/Text';
import { PostNftsFragment$key } from '~/generated/PostNftsFragment.graphql';
import colors from '~/shared/theme/colors';

import PostNftPreview from './PostNftPreview';

type Props = {
  postRef: PostNftsFragment$key;
  onNftLoad?: () => void;
};

export default function PostNfts({ postRef, onNftLoad }: Props) {
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

  if (!post.tokens) {
    reportError(`PostData: post.tokens is null - ${post.dbid}`);
  }

  const token = post.tokens && post.tokens[0];
  return (
    <StyledTokenContainer justify="center" align="center">
      {token ? (
        <PostNftPreview tokenRef={token} onNftLoad={onNftLoad} />
      ) : (
        <BaseM color={colors.shadow}>There was an error displaying this item</BaseM>
      )}
    </StyledTokenContainer>
  );
}

const StyledTokenContainer = styled(HStack)`
  @media only screen and ${breakpoints.desktop} {
    padding: 24px;
  }
`;

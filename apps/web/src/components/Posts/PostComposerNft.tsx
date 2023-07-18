import { useEffect } from 'react';
import { graphql, useFragment, useLazyLoadQuery } from 'react-relay';
import styled from 'styled-components';

import { PostComposerNftFragment$key } from '~/generated/PostComposerNftFragment.graphql';
import { PostComposerNftQuery } from '~/generated/PostComposerNftQuery.graphql';
import colors from '~/shared/theme/colors';

import { VStack } from '../core/Spacer/Stack';
import { BaseS, TitleS } from '../core/Text/Text';
import PostComposerAsset from './PostComposerAsset';

type Props = {
  tokenRef: PostComposerNftFragment$key;
};

export function PostComposerNftLoadingState() {
  return (
    <StyledTokenContainer gap={4}>
      <StyledAssetLoadingState />
    </StyledTokenContainer>
  );
}

export default function PostComposerNft({ tokenRef }: Props) {
  const token = useFragment(
    graphql`
      fragment PostComposerNftFragment on Token {
        __typename
        name
        contract {
          name
        }
        ...PostComposerAssetFragment
      }
    `,
    tokenRef
  );

  // const token = query.tokenById;
  // if (token?.__typename !== 'Token') {
  //   throw new Error('Invalid token');
  // }

  return (
    <StyledTokenContainer gap={4}>
      <PostComposerAsset tokenRef={token} />

      <VStack>
        <TitleS>{token.name}</TitleS>

        <BaseS color={colors.metal}>{token.contract?.name}</BaseS>
      </VStack>
    </StyledTokenContainer>
  );
}
const StyledTokenContainer = styled(VStack)`
  width: 180px;
`;

const StyledAssetLoadingState = styled.div`
  width: 180px;
  height: 180px;
`;

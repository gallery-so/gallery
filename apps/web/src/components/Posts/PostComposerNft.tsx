import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { PostComposerNftFragment$key } from '~/generated/PostComposerNftFragment.graphql';
import CloseIcon from '~/icons/CloseIcon';
import colors from '~/shared/theme/colors';

import { VStack } from '../core/Spacer/Stack';
import { BaseS, TitleS } from '../core/Text/Text';
import PostComposerAsset from './PostComposerAsset';

type Props = {
  tokenRef: PostComposerNftFragment$key;
  onBackClick: () => void;
};

export function PostComposerNftLoadingState() {
  return (
    <StyledTokenContainer gap={4}>
      <StyledAssetLoadingState />
    </StyledTokenContainer>
  );
}

export default function PostComposerNft({ tokenRef, onBackClick }: Props) {
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

  const handleCloseClick = useCallback(() => {
    onBackClick();
  }, [onBackClick]);

  return (
    <StyledTokenContainer gap={4}>
      <StyledAssetContainer>
        <StyledCloseButton onClick={handleCloseClick}>
          <CloseIcon size={8} />
        </StyledCloseButton>
        <PostComposerAsset tokenRef={token} />
      </StyledAssetContainer>

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

const StyledCloseButton = styled.button`
  position: absolute;
  right: -4px;
  top: -4px;
  background: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${colors.black['800']};
  border-radius: 50%;
  height: 16px;
  width: 16px;
  cursor: pointer;
  padding: 0;
  opacity: 0;
  transition: opacity 0.1s ease-in-out;
`;

const StyledAssetContainer = styled.div`
  position: relative;
  &:hover {
    ${StyledCloseButton} {
      opacity: 1;
    }
  }
`;

import styled from 'styled-components';

import colors from '~/shared/theme/colors';

import { VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { CollectionGroup } from '../GalleryEditor/PiecesSidebar/groupCollectionsByAddress';
import { NftSelectorToken } from './NftSelectorToken';

type Props = {
  group: CollectionGroup;
};

export function NftSelectorTokenPreview({ group }: Props) {
  const tokens = group.tokens;

  if (tokens.length === 1) {
    // @ts-ignore TODO: fix this
    return <NftSelectorToken tokenRef={tokens[0]} />;
  }

  const showTokens = tokens.slice(0, 4);
  const remainingTokens = tokens.length - showTokens.length;

  return (
    <StyledNftSelectorTokensContainer>
      {showTokens.map((token) => {
        // @ts-ignore TODO: fix this
        return <NftSelectorToken key={token.id} tokenRef={token} />;
      })}
      {remainingTokens > 0 && (
        <StyledRemainingTokens align="center" justify="center">
          <BaseM>+ {remainingTokens}</BaseM>
        </StyledRemainingTokens>
      )}
    </StyledNftSelectorTokensContainer>
  );
}

const StyledNftSelectorTokensContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  background-color: #eeeeee;
  padding: 10px;
  gap: 8px;
  position: relative;
`;

const StyledRemainingTokens = styled(VStack)`
  position: absolute;
  bottom: 4px;
  right: 4px;

  background-color: ${colors.black[800]};
  border: 2px solid ${colors.white};
  padding: 4px 8px;

  ${BaseM} {
    color: ${colors.white};
    font-weight: 500;
  }
`;

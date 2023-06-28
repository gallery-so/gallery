import { useCallback } from 'react';
import styled, { css } from 'styled-components';

import colors from '~/shared/theme/colors';
import noop from '~/utils/noop';

import { VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import transitions from '../core/transitions';
import { NftSelectorCollectionGroup } from './groupNftSelectorCollectionsByAddress';
import { NftSelectorContractType } from './NftSelector';
import { NftSelectorToken } from './NftSelectorToken';

type Props = {
  group: NftSelectorCollectionGroup;
  onSelectGroup?: (collection: NftSelectorContractType) => void;
};

export function NftSelectorTokenPreview({ group, onSelectGroup = noop }: Props) {
  const tokens = group.tokens;

  const handleSelectGroup = useCallback(() => {
    const collection = {
      title: group.title,
      address: group.address,
    };

    onSelectGroup(collection);
  }, [group.address, group.title, onSelectGroup]);

  const NftSelectorTokenCollection = () => {
    return (
      <StyledNftSelectorTokenCollection>
        <BaseM>{group.title}</BaseM>
      </StyledNftSelectorTokenCollection>
    );
  };

  if (tokens.length === 1) {
    return (
      <StyledNftSelectorTokensContainer>
        {tokens[0] && <NftSelectorToken tokenRef={tokens[0]} />}
        <NftSelectorTokenCollection />
      </StyledNftSelectorTokensContainer>
    );
  }

  const showTokens = tokens.slice(0, 4);
  const remainingTokens = tokens.length - showTokens.length;

  return (
    <StyledNftSelectorTokensContainer isGrouped onClick={handleSelectGroup}>
      {showTokens.map((token, index) => (
        <NftSelectorToken
          key={`${token.contract?.contractAddress}-${index}`}
          tokenRef={token}
          isInGroup
        />
      ))}
      {remainingTokens > 0 && (
        <StyledRemainingTokens align="center" justify="center">
          <BaseM>+ {remainingTokens}</BaseM>
        </StyledRemainingTokens>
      )}
      <NftSelectorTokenCollection />
    </StyledNftSelectorTokensContainer>
  );
}

const StyledNftSelectorTokenCollection = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  background-color: ${colors.black[800]};
  border: 1px solid ${colors.black['DEFAULT']};
  padding: 4px 8px;

  transition: opacity ${transitions.cubic};
  opacity: 0;

  transition: transform ${transitions.cubic};
  transform: translateY(5px);

  ${BaseM} {
    color: ${colors.white};
  }
`;

const StyledNftSelectorTokensContainer = styled.div<{
  isGrouped?: boolean;
}>`
  position: relative;
  aspect-ratio: 1;

  overflow: hidden;

  ${({ isGrouped }) =>
    isGrouped &&
    css`
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      background-color: #eeeeee;
      padding: 10px;
      gap: 8px;
    `}

  &:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.25);

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.55);
    }

    ${StyledNftSelectorTokenCollection} {
      opacity: 1;
      z-index: 1;
      transform: translateY(0px);
    }
  }
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

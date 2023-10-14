import { useCallback, useMemo } from 'react';
import styled, { css } from 'styled-components';

import colors from '~/shared/theme/colors';
import { noop } from '~/shared/utils/noop';

import { VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import transitions from '../core/transitions';
import { NftSelectorCollectionGroup } from './groupNftSelectorCollectionsByAddress';
import { NftSelectorContractType } from './NftSelector';
import { NftSelectorToken } from './NftSelectorToken';

type Props = {
  group: NftSelectorCollectionGroup;
  onSelectToken: (tokenId: string) => void;
  onSelectContract?: (collection: NftSelectorContractType) => void;
  hasSelectedContract: boolean;
};

const NftSelectorTokenCollection = ({ title }: { title: string }) => {
  return (
    <StyledNftSelectorTokenCollection>
      <StyledBaseM>{title}</StyledBaseM>
    </StyledNftSelectorTokenCollection>
  );
};

export function NftSelectorTokenPreview({
  group,
  onSelectToken,
  onSelectContract = noop,
  hasSelectedContract,
}: Props) {
  const tokens = group.tokens;

  const handleSelectContract = useCallback(() => {
    const collection = {
      title: group.title,
      address: group.address,
    };

    onSelectContract(collection);
  }, [group.address, group.title, onSelectContract]);

  const singleTokenTitle = useMemo(() => {
    const token = tokens[0];
    if (token && hasSelectedContract) {
      return token.name || `#${token.tokenId}`;
    }
    return group.title;
  }, [group.title, hasSelectedContract, tokens]);

  if (tokens.length === 1) {
    return (
      <StyledNftSelectorTokensContainer>
        {tokens[0] && <NftSelectorToken tokenRef={tokens[0]} onSelectToken={onSelectToken} />}
        <NftSelectorTokenCollection title={singleTokenTitle} />
      </StyledNftSelectorTokensContainer>
    );
  }

  const showTokens = tokens.slice(0, 4);
  const remainingTokens = tokens.length - showTokens.length;

  return (
    <StyledNftSelectorTokensContainer isGrouped onClick={handleSelectContract}>
      {showTokens.map((token) => (
        <NftSelectorToken
          key={token.dbid}
          tokenRef={token}
          isInGroup
          onSelectToken={onSelectToken}
        />
      ))}
      {remainingTokens > 0 && (
        <StyledRemainingTokens align="center" justify="center">
          <BaseM>+ {remainingTokens}</BaseM>
        </StyledRemainingTokens>
      )}
      <NftSelectorTokenCollection title={group.title} />
    </StyledNftSelectorTokensContainer>
  );
}

const StyledBaseM = styled(BaseM)`
  word-wrap: break-word;
  word-break: break-all;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  overflow: hidden;
  text-overflow: ellipsis;
`;

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
  padding: 4px 8px;

  ${BaseM} {
    color: ${colors.white};
    font-weight: 500;
  }
`;

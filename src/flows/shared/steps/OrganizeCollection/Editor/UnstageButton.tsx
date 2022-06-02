import { useCallback } from 'react';
import styled from 'styled-components';
import { BaseM } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';

type Props = {
  id: string; // id of staged item to remove
  className?: string;
};
function UnstageButton({ id, className }: Props) {
  const { setTokensIsSelected, unstageTokens } = useCollectionEditorActions();

  const handleOnClick = useCallback(() => {
    setTokensIsSelected([id], false);
    unstageTokens([id]);
  }, [id, setTokensIsSelected, unstageTokens]);

  return (
    <StyledUnstageButton className={className} onClick={handleOnClick}>
      <BaseM color={colors.white}>REMOVE</BaseM>
    </StyledUnstageButton>
  );
}

export const StyledUnstageButton = styled.button`
  position: absolute;
  right: 0;

  padding: 8px;

  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
`;
export default UnstageButton;

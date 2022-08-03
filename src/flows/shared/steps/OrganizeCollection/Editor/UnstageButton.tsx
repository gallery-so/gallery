import { useCallback } from 'react';
import styled from 'styled-components';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';
import TrashIcon from 'src/icons/Trash';
import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';

type Props = {
  className?: string;
  // id of staged item to remove
  id: string;
  // use `icon` for simple icon, `text` to be more visible
  variant?: 'icon' | 'text';
};
function UnstageButton({ id, className, variant = 'icon' }: Props) {
  const { setTokensIsSelected, unstageTokens } = useCollectionEditorActions();

  const handleOnClick = useCallback(() => {
    setTokensIsSelected([id], false);
    unstageTokens([id]);
  }, [id, setTokensIsSelected, unstageTokens]);

  return (
    <StyledUnstageButton className={className} onClick={handleOnClick}>
      {variant === 'icon' ? <StyledTrashIcon /> : <BaseM color={colors.white}>REMOVE</BaseM>}
    </StyledUnstageButton>
  );
}

// guarantee this will come in handy somehow
const StyledTrashIcon = styled(TrashIcon)``;

export const StyledUnstageButton = styled.button`
  position: absolute;
  right: 0;

  padding: 8px;

  background: none;
  border: none;
  z-index: 4;
  cursor: pointer;
`;

export default UnstageButton;

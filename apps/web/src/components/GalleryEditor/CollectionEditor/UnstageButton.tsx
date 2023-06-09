import { useCallback } from 'react';
import styled from 'styled-components';

import { BaseM } from '~/components/core/Text/Text';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import TrashIcon from '~/icons/Trash';
import colors from '~/shared/theme/colors';

type Props = {
  className?: string;
  // id of staged item to remove
  id: string;
  // use `icon` for simple icon, `text` to be more visible
  variant?: 'icon' | 'text';
};
function UnstageButton({ id, className, variant = 'icon' }: Props) {
  const { toggleTokenStaged } = useCollectionEditorContext();

  const handleOnClick = useCallback(() => {
    toggleTokenStaged(id);
  }, [id, toggleTokenStaged]);

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

  // dark magic that allows the child SVG to be visible regardless of background color
  mix-blend-mode: exclusion;
`;

export default UnstageButton;

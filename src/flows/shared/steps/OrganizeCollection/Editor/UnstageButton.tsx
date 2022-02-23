import { useCallback } from 'react';
import styled from 'styled-components';
import { BodyRegular } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';

type Props = {
  id: string; // id of staged item to remove
  className?: string;
};
function UnstageButton({ id, className }: Props) {
  const { setNftsIsSelected, unstageNfts } = useCollectionEditorActions();

  const handleOnClick = useCallback(() => {
    setNftsIsSelected([id], false);
    unstageNfts([id]);
  }, [id, setNftsIsSelected, unstageNfts]);

  return (
    <StyledUnstageButton className={className} onClick={handleOnClick}>
      <BodyRegular color={colors.white}>REMOVE</BodyRegular>
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

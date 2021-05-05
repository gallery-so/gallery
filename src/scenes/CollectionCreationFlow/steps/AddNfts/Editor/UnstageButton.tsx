import { useCallback } from 'react';
import styled from 'styled-components';
import { Text } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';

type Props = {
  nftIndex: number;
  className?: string;
};
function UnstageButton({ nftIndex, className }: Props) {
  const { setNftIsSelected } = useCollectionEditorActions();
  const handleOnClick = useCallback(() => {
    setNftIsSelected(nftIndex, false);
  }, [nftIndex, setNftIsSelected]);
  return (
    <StyledUnstageButton className={className} onClick={handleOnClick}>
      <Text color={colors.white}>DELETE</Text>
    </StyledUnstageButton>
  );
}

export const StyledUnstageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 0;

  background: none;
  border: none;
  z-index: 10;
  cursor: pointer;
`;
export default UnstageButton;

import { useCallback } from 'react';
import styled from 'styled-components';
import { BodyRegular } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useCollectionEditorActions } from 'contexts/collectionEditor/CollectionEditorContext';

type Props = {
  nftIndex: number;
  className?: string;
  nftId: string;
};
function UnstageButton({ nftIndex, className, nftId }: Props) {
  const { setNftIsSelected, unstageNft } = useCollectionEditorActions();

  const handleOnClick = useCallback(() => {
    setNftIsSelected(nftIndex, false);
    unstageNft(nftId);
  }, [nftId, nftIndex, setNftIsSelected, unstageNft]);

  return (
    <StyledUnstageButton className={className} onClick={handleOnClick}>
      <BodyRegular color={colors.white}>DELETE</BodyRegular>
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

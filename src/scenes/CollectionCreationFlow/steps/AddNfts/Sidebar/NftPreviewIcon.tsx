import useEffectAfterMount from 'hooks/useEffectAfterMount';
import { memo, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Nft } from 'types/Nft';

type NftPreviewIconProps = {
  nft: Nft; // TODO: this will be an object in the future
  stageNft: (nft: Nft) => void;
  unstageNft: (id: string) => void;
  onSelectNft: (index: number, didSelect: boolean) => void;
  index: number;
};

function NftPreviewIcon({
  nft,
  stageNft,
  unstageNft,
  onSelectNft,
  index,
}: NftPreviewIconProps) {
  const isSelected = useMemo(() => !!nft.isSelected, [nft.isSelected]);

  const handleClick = useCallback(() => {
    onSelectNft(index, !isSelected);
  }, [index, isSelected, onSelectNft]);

  const handleUpdate = useCallback(() => {
    isSelected ? stageNft(nft) : unstageNft(nft.id);
  }, [isSelected, nft, stageNft, unstageNft]);

  useEffectAfterMount(handleUpdate);

  return (
    <StyledNftPreviewIcon>
      <StyledImage isSelected={isSelected} src={nft.image_url} alt="nft" />
      <StyledOutline onClick={handleClick} isSelected={isSelected} />
    </StyledNftPreviewIcon>
  );
}

const StyledNftPreviewIcon = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
`;

type SelectedProps = {
  isSelected: boolean;
};

const StyledOutline = styled.div<SelectedProps>`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;

  outline: ${({ isSelected }) => (isSelected ? 1 : 0)}px solid #14ff00;
`;

const StyledImage = styled.img<SelectedProps>`
  width: 100%;
  height: 100%;

  transition: opacity 0.2s;

  opacity: ${({ isSelected }) => (isSelected ? 0.5 : 1)};
`;

export default memo(NftPreviewIcon);

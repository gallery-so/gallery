import { memo } from 'react';
import { EditModeNft } from '../types';
import SortableStagedBlankBlock from './SortableStagedBlankBlock';
import SortableStagedNft from './SortableStagedNft';

type Props = {
  editModeNft: EditModeNft;
  size: number;
};

function SortableStagedItem({ editModeNft, size }: Props) {
  if (!editModeNft.nft) {
    // Blank block
    return <SortableStagedBlankBlock id={editModeNft.id} size={size} />;
  }

  return <SortableStagedNft nft={editModeNft.nft} size={size} />;
}

export default memo(SortableStagedItem);

import { memo } from 'react';
import { isEditModeNft, StagingItem } from '../types';
import SortableStagedWhitespace from './SortableStagedWhitespace';
import SortableStagedNft from './SortableStagedNft';

type Props = {
  stagedItem: StagingItem;
  size: number;
};

// SortableStagedItem is used for any item in the DnD staging area. It can be a blankspace, or an NFT.
function SortableStagedItem({ stagedItem, size }: Props) {
  return isEditModeNft(stagedItem) ? (
    <SortableStagedNft nft={stagedItem.nft} size={size} />
  ) : (
    <SortableStagedWhitespace id={stagedItem.id} size={size} />
  );
}

export default memo(SortableStagedItem);

import { EditModeNft } from 'flows/shared/steps/OrganizeCollection/types';
import { SidebarNftsState } from './CollectionEditorContext';

/**
 * This is a temporary solution that consolidates all NFTs that share the same
 * Opensea ID into one unit on the frontend. This addresses an edge case where
 * users who own multiple ERC-1155s across different wallets – who then transfer
 * those NFTs in and out of their wallets – trigger uniqueness constraints.
 *
 * In the long run:
 * 1) we will move off of opensea
 * 2) we'll associate NFTs in our main database with user IDs, instead of just
 *    wallet addresses
 */
export default function deduplicateObjectByOpenseaIdAndPreferEarliest(
  obj: SidebarNftsState
): SidebarNftsState {
  const objectByOpenseaId: Record<string, EditModeNft> = {};
  for (const k in obj) {
    const v = obj[k];
    const { openseaId } = v.nft;

    // if the backend isn't providing openseaIds, fall back to the original
    // set of NFTs (which may contain dupes) instead of erroring
    if (!openseaId) {
      return obj;
    }

    const exists = objectByOpenseaId[openseaId];
    if (exists && exists.id < v.id) {
      continue;
    }
    objectByOpenseaId[openseaId] = v;
  }

  const newObj: SidebarNftsState = {};
  for (const k in objectByOpenseaId) {
    const v = objectByOpenseaId[k];
    newObj[v.id] = v;
  }

  return newObj;
}

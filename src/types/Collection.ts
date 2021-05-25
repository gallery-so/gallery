import { Nft } from './Nft';

export type Collection = {
  nfts: Nft[];
  id: string;
  title?: string;
  description?: string;
  isHidden?: boolean;
};

type CollectionsNotFoundError = {
  error: 'ERR_NO_COLLECTIONS_FOUND_FOR_USER';
};

export type CollectionsResponse =
  | { collections: Collection[] }
  | CollectionsNotFoundError;

// typeguard
export function isCollectionsResponseError(
  res: CollectionsResponse
): res is CollectionsNotFoundError {
  return 'error' in res;
}

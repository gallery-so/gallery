import { useCallback } from 'react';
import {
  CreateCollectionRequest,
  CreateCollectionResponse,
} from 'types/Collection';
import usePost from './rest/usePost';

export default function useCreateCollection() {
  const createCollection = usePost();

  return useCallback(
    async (nftIds: string[]) => {
      const result = await createCollection<
        CreateCollectionResponse,
        CreateCollectionRequest
      >('/collections/create', 'create collection', {
        nfts: nftIds,
      });

      return result;
    },
    [createCollection]
  );
}

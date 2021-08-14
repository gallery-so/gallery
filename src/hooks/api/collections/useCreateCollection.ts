import { useCallback } from 'react';
import { CreateCollectionRequest, CreateCollectionResponse } from './types';
import usePost from '../_rest/usePost';

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

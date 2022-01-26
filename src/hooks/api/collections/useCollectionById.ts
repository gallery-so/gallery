import { Collection } from 'types/Collection';
import { GetCollectionResponse } from './types';
import useGet from '../_rest/useGet';

export default function useCollectionById(id: string): Collection | undefined {
  const data = useGet<GetCollectionResponse>(`/collections/get?id=${id}`, 'fetch collection');

  return data?.collection;
}

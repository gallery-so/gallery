import { Collection } from 'types/Collection';
import { GetCollectionResponse } from './types';
import useGet from '../_rest/useGet';

type Props = {
  id: string;
};

export const getCollectionByIdAction = 'fetch collection by id';
const getCollectionByIdBaseUrl = '/collections/get';

function getCollectionByIdBaseUrlWithQuery({ id }: Props) {
  return `${getCollectionByIdBaseUrl}?id=${id}`;
}

export function getCollectionByIdCacheKey({ id }: Props) {
  if (!id) {
    return '';
  }

  return [getCollectionByIdBaseUrlWithQuery({ id }), getCollectionByIdAction];
}

export default function useCollectionById({ id }: Props): Collection | undefined {
  const data = useGet<GetCollectionResponse>(
    id ? getCollectionByIdBaseUrlWithQuery({ id }) : null,
    getCollectionByIdAction
  );

  return data?.collection;
}

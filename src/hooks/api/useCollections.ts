import useSwr from 'swr';
import {
  Collection,
  CollectionsResponse,
  isCollectionsResponseError,
} from 'types/Collection';
import { User } from 'types/User';

type Props = {
  userId: User['id'];
};

export default function useCollections({ userId }: Props): Collection[] | null {
  const { data } = useSwr<CollectionsResponse>(
    `/collections/get?user_id=${userId}`
  );

  if (!data || isCollectionsResponseError(data)) {
    return null;
  }

  return data.collections;
}

import useSwr from 'swr';
import { Collection, GetCollectionsResponse } from 'types/Collection';
import { User } from 'types/User';

type Props = {
  userId: User['id'];
};

export default function useCollections({ userId }: Props): Collection[] | null {
  const { data } = useSwr<GetCollectionsResponse>(
    `/collections/get?user_id=${userId}`
  );

  if (!data) {
    return null;
  }

  return data.collections;
}

import useSwr from 'swr';
import {
  Collection,
  CollectionsResponse,
  isCollectionsResponseError,
} from 'types/Collection';

type Props = {
  username: string;
};
export default function useCollections({
  username,
}: Props): Collection[] | null {
  const { data } = useSwr<CollectionsResponse>(
    `/collections/get?username=${username}`
  );

  if (!data || isCollectionsResponseError(data)) {
    return null;
  }

  return data.collections;
}

import useSwr from 'swr';
import { Gallery, GetGalleriesResponse } from 'types/Gallery';
import { User } from 'types/User';

type Props = {
  userId: User['id'];
};

export default function useGalleries({ userId }: Props): Gallery[] | null {
  const { data } = useSwr<GetGalleriesResponse>(
    `/galleries/user_get?user_id=${userId}`
  );

  if (!data) {
    return null;
  }

  return data.galleries;
}

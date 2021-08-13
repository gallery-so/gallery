import { Gallery, GetGalleriesResponse } from 'types/Gallery';
import { User } from 'types/User';
import useGet from './rest/useGet';

type Props = {
  userId?: User['id'];
};

export default function useGalleries({ userId }: Props): Gallery[] | undefined {
  const data = useGet<GetGalleriesResponse>(
    userId ? `/galleries/user_get?user_id=${userId}` : null,
    'fetch gallery'
  );

  return data?.galleries;
}

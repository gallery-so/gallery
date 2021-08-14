import { GetGalleriesResponse } from './types';
import { Gallery } from 'types/Gallery';
import useGet from '../_rest/useGet';
import { User } from 'types/User';

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

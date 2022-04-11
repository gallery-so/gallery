import { Gallery } from 'types/Gallery';
import { User } from 'types/User';
import useGet from '../_rest/useGet';
import { GetGalleriesResponse } from './types';

type Props = {
  userId: User['id'];
};

const getGalleriesAction = 'fetch gallery';

const getGalleriesBaseUrl = '/galleries/user_get';

function getGalleriesBaseUrlWithQuery({ userId }: Props) {
  return `${getGalleriesBaseUrl}?user_id=${userId}`;
}

export default function useGalleries({ userId }: Props): Gallery[] | undefined {
  const data = useGet<GetGalleriesResponse>(
    userId ? `${getGalleriesBaseUrlWithQuery({ userId })}` : null,
    getGalleriesAction
  );

  return data?.galleries;
}

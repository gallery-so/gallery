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

// Allows access to galleries cache within SWR. useful for mutations
export function getGalleriesCacheKey({ userId }: Props) {
  if (!userId) {
    return '';
  }

  return [getGalleriesBaseUrlWithQuery({ userId }), getGalleriesAction];
}

export default function useGalleries({ userId }: Props): Gallery[] | undefined {
  const data = useGet<GetGalleriesResponse>(
    userId ? `${getGalleriesBaseUrlWithQuery({ userId })}` : null,
    getGalleriesAction,
  );

  return data?.galleries;
}

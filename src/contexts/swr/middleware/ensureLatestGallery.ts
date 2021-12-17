import { useEffect, useRef } from 'react';
import { Key, Middleware } from 'swr';
import { GetGalleriesResponse } from 'hooks/api/galleries/types';
import { getGalleriesAction } from 'hooks/api/galleries/useGalleries';

function getTimeFromISOString(timestamp: string) {
  return new Date(timestamp).getTime();
}

// @ts-expect-error: TODO this is erroring because of `data` type returned in L39
const ensureLatestGallery: Middleware = (useSWRNext) => (key: Key, fetcher, config) => {
  const swr = useSWRNext(key, fetcher, config);

  // gallery requests are identified through a tuple of [endpoint, action_type]
  const isFetchingGallery = Array.isArray(key) && key[1] === getGalleriesAction;
  if (!isFetchingGallery || !swr.data) {
    return swr;
  }

  const galleryWithLatestTimestamp = useRef<GetGalleriesResponse | undefined>(undefined);

  // @ts-expect-error this route will always return `GetGalleriesResponse` type
  const currentTimestamp = swr.data.galleries[0].last_updated;
  const previousTimestamp = galleryWithLatestTimestamp.current?.galleries[0].last_updated ?? 0;
  useEffect(() => {
    if (getTimeFromISOString(currentTimestamp) > previousTimestamp) {
      // @ts-expect-error this route will always return `GetGalleriesResponse` type
      galleryWithLatestTimestamp.current = swr.data;
    }
  }, [currentTimestamp, previousTimestamp, swr.data]);

  const isFirstRender = !galleryWithLatestTimestamp.current;
  if (isFirstRender) {
    return swr;
  }

  return {
    ...swr,
    data: galleryWithLatestTimestamp.current,
  };
};

export default ensureLatestGallery;

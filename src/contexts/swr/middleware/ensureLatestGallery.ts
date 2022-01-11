import { useEffect, useRef } from 'react';
import { Key, Middleware } from 'swr';
import { GetGalleriesResponse } from 'hooks/api/galleries/types';
import { getGalleriesAction } from 'hooks/api/galleries/useGalleries';

function getTimeFromISOString(timestamp: string | number) {
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

  const previousData = useRef<GetGalleriesResponse | undefined>(undefined);

  const currentTimestamp = getTimeFromISOString(
    // @ts-expect-error this route will always return `GetGalleriesResponse` type
    swr.data.galleries.length > 0 ? swr.data.galleries[0].last_updated : 0
  );

  const previousTimestamp = getTimeFromISOString(
    previousData.current?.galleries[0]?.last_updated ?? 0
  );

  const serverHasLatestTimestamp = currentTimestamp > previousTimestamp;

  useEffect(() => {
    if (serverHasLatestTimestamp) {
      // @ts-expect-error this route will always return `GetGalleriesResponse` type
      previousData.current = swr.data;
    }
  }, [serverHasLatestTimestamp, swr.data]);

  if (serverHasLatestTimestamp) {
    return swr;
  }

  return {
    ...swr,
    data: previousData.current,
  };
};

export default ensureLatestGallery;

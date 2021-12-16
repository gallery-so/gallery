import { getGalleriesAction } from 'hooks/api/galleries/useGalleries';
import { Key, Middleware, unstable_serialize } from 'swr';

function getTimeFromISOString(timestamp: string) {
  return new Date(timestamp).getTime();
}

const ensureLatestGallery: Middleware = (useSWRNext) => (key: Key, fetcher, config) => {
  console.log('key', key[0]);
  const dataInCache = config.cache.get(unstable_serialize(key));
  console.log(JSON.stringify(dataInCache));
  const isFetchingGallery = Array.isArray(key) && key[1] === getGalleriesAction;
  if (!isFetchingGallery) {
    return useSWRNext(key, fetcher, config);
  }

  // console.log(key);

  // @ts-expect-error: `cache` field is not publicly accessible on TS def
  // const dataInCache = config.cache.get(unstable_serialize(key));
  // let localLastUpdated = 0
  // if (dataInCache) {
  // const localLastUpdated = dataInCache.galleries[0].last_updated;
  // console.log('prev', localLastUpdated);
  // console.log({ dataInCache });
  // }

  // const swr = useSWRNext(key, fetcher, config);

  // const dataFromServer = swr.data;
  // if (dataInCache && dataFromServer) {
  //   const localLastUpdated = dataInCache.galleries[0].last_updated;
  //   const serverLastUpdated = dataFromServer.galleries[0].last_updated;
  //   console.log({ localLastUpdated, serverLastUpdated });
  //   // if (getTimeFromISOString(localLastUpdated) > getTimeFromISOString(serverLastUpdated)) {

  //   // }
  // }

  // return useSWRNext(key, fetcher, config);
};

export default ensureLatestGallery;

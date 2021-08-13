import { useCallback } from 'react';
import useFetcher from 'contexts/swr/useFetcher';
import RequestAction from './RequestAction';

/**
 * Returns a callback to make post requests (mutations). The callback
 * should be named according to the action it'll take, then used as
 * needed (useCallback, useEffect, etc.)
 *
 * Usage:
 *
 *   const createCollection = usePost()
 *
 *   const handleClick = useCallback(() => {
 *     createCollection('/collections', 'create collection', {
 *       title: 'FVCKCRYSTALS',
 *       description: 'my fuckcrystals',
 *     })
 *   })
 *
 *  return <Button onClick={handleClick} />
 *
 */
export default function usePost<ResponseType = {}>() {
  const fetcher = useFetcher();

  return useCallback(
    async function postRequest(
      path: string,
      action: RequestAction,
      body: Record<string, string>
    ) {
      await fetcher<ResponseType>(path, action, {
        body,
      });
    },
    [fetcher]
  );
}

import { useCallback, useState } from 'react';
import { RefetchFnInexact } from 'react-relay/relay-hooks/useRefetchableFragmentNode';
import { OperationType } from 'relay-runtime';

export function useRefreshHandle<T extends RefetchFnInexact<OperationType>>(refetch: T) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);

    refetch(
      {},
      {
        fetchPolicy: 'store-and-network',
        onComplete: () => {
          setIsRefreshing(false);
        },
      }
    );
  }, [refetch]);

  return { isRefreshing, handleRefresh };
}

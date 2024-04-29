import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type UnlockFunction = () => void;

type SyncTokensLockContextType = {
  isSyncing: boolean;
  isLocked: boolean;
  lock: () => UnlockFunction;
  startSyncing: () => void;
  stopSyncing: () => void;
};

const SyncTokensLockContext = createContext<SyncTokensLockContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function SyncTokensLockProvider({ children }: Props) {
  const [isLocked, setIsLocked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const lock = useCallback(() => {
    setIsLocked((previous) => {
      if (previous) {
        throw new Error('Tried to obtain a lock on SyncTokensLock when a lock was already present');
      }

      return true;
    });

    return () => setIsLocked(false);
  }, []);

  const startSyncing = useCallback(() => {
    setIsSyncing(true);
  }, []);

  const stopSyncing = useCallback(() => {
    setIsSyncing(false);
  }, []);

  const value = useMemo(() => {
    return {
      isLocked,
      lock,
      isSyncing,
      startSyncing,
      stopSyncing,
    };
  }, [isLocked, lock, isSyncing, startSyncing, stopSyncing]);

  return <SyncTokensLockContext.Provider value={value}>{children}</SyncTokensLockContext.Provider>;
}

export function useSyncTokensContext() {
  const context = useContext(SyncTokensLockContext);

  if (!context) {
    throw new Error('useSyncTokensContext must be used within a SyncTokensLockProvider');
  }

  return context;
}

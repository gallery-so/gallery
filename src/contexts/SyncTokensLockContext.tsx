import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type UnlockFunction = () => void;

type SyncTokensLockContextType = {
  isLocked: boolean;
  lock: () => UnlockFunction;
};

const SyncTokensLockContext = createContext<SyncTokensLockContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

export function SyncTokensLockProvider({ children }: Props) {
  const [isLocked, setIsLocked] = useState(false);

  const lock = useCallback(() => {
    setIsLocked((previous) => {
      if (previous) {
        throw new Error('Tried to obtain a lock on SyncTokensLock when a lock was already present');
      }

      return true;
    });

    return () => setIsLocked(false);
  }, []);

  const value = useMemo(() => {
    return {
      isLocked,
      lock,
    };
  }, [lock, isLocked]);

  return <SyncTokensLockContext.Provider value={value}>{children}</SyncTokensLockContext.Provider>;
}

export function useSyncTokensContext() {
  const value = useContext(SyncTokensLockContext);

  if (!value) {
    throw new Error('Tried to use SyncTokensLockContext without a provider.');
  }

  return value;
}

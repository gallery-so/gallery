import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const CanGoBackContext = createContext(false);

type Props = {
  children: ReactNode;
};

export function CanGoBackProvider({ children }: Props) {
  const [historyStackLength, setHistoryStackLength] = useState(0);

  const canGoBack = historyStackLength > 0;

  useEffect(() => {
    const originalPushState = window.history.pushState;

    window.history.pushState = (...args) => {
      originalPushState.bind(window.history)(...args);

      setHistoryStackLength(window.history.state.idx ?? 0);
    };

    function handlePopState() {
      setHistoryStackLength(window.history.state.idx ?? 0);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.history.pushState = originalPushState;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return <CanGoBackContext.Provider value={canGoBack}>{children}</CanGoBackContext.Provider>;
}

export function useCanGoBack() {
  return useContext(CanGoBackContext);
}

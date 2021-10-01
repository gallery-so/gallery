import { globalHistory } from '@reach/router';
import { NAVIGATION_TRANSITION_TIME_MS } from 'components/FadeTransitioner/FadeTransitioner';
import { createContext, memo, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react';

type NavigationContextType = {
  getVisitedPagesLength: () => number;
  handleNavigationScrollPosition: () => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('Attempted to use NavigationContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode; locationKey?: string };

const NavigationContextProvider = memo(({ children, locationKey }: Props) => {
  // keeps track of previous page's scroll position as user navigates
  const previousScrollPosition = useRef(window.scrollY);
  useEffect(() => {
    previousScrollPosition.current = window.scrollY;
  }, [locationKey]);

  // keeps track of the navigation action (e.g. PUSH vs POP)
  const navigationAction = useRef('');
  useEffect(() => {
    const removeListener = globalHistory.listen(({ action }) => {
      navigationAction.current = action;
    });

    return removeListener;
  }, []);

  // keeps track of history length since visiting the app
  const visitedPagesLength = useRef(0);
  useEffect(() => {
    visitedPagesLength.current++;
  }, [locationKey]);

  const getVisitedPagesLength = useCallback(() => visitedPagesLength.current, []);

  const handleNavigationScrollPosition = useCallback(() => {
    /**
     * Maintain scroll position of previous page if user clicks "back".
     * While this is technically default browser behavior, our CSSTransition
     * gets in the way and returns the user to a weird spot without this hack
     */
    const maintainScrollPosition = navigationAction.current === 'POP';
    const previousPosition = previousScrollPosition.current;
    setTimeout(() => {
      if (maintainScrollPosition) {
        window.scrollTo({ top: previousPosition });
        return;
      }

      window.scrollTo({ top: 0 });
    }, NAVIGATION_TRANSITION_TIME_MS);
  }, []);

  const value = useMemo(() => ({
    getVisitedPagesLength,
    handleNavigationScrollPosition,
  }), [getVisitedPagesLength, handleNavigationScrollPosition]);

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
});

export default NavigationContextProvider;


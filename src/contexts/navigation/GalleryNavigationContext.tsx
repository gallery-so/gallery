import { globalHistory, navigate } from '@reach/router';
import { NAVIGATION_TRANSITION_TIME_MS } from 'components/FadeTransitioner/FadeTransitioner';
import { createContext, memo, ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import sanitizePathname from './sanitizePathname';

type NavigationState = {
  sanitizedPathname: string;
};

const NavigationStateContext = createContext<NavigationState | undefined>(undefined);

export const useGalleryNavigationState = (): NavigationState => {
  const context = useContext(NavigationStateContext);
  if (!context) {
    throw new Error('Attempted to use NavigationStateContext without a provider!');
  }

  return context;
};

type NavigationActions = {
  getVisitedPagesLength: () => number;
  handleNavigationScrollPosition: () => void;
};

const NavigationActionsContext = createContext<NavigationActions | undefined>(undefined);

export const useGalleryNavigationActions = (): NavigationActions => {
  const context = useContext(NavigationActionsContext);
  if (!context) {
    throw new Error('Attempted to use NavigationActionsContext without a provider!');
  }

  return context;
};

type Props = {
  children: ReactNode;
  pathname: string;
  locationKey?: string;
};

const GalleryNavigationContextProvider = memo(({ children, pathname, locationKey }: Props) => {
  const sanitizedPathname = useMemo(() => sanitizePathname(pathname), [pathname]);

  // drop trailing slash: /bingbong/ => /bingbong
  useEffect(() => {
    if (pathname !== sanitizedPathname) {
      void navigate(
        sanitizedPathname,
        { replace: true }, // option to keep history unchanged
      );
    }
  }, [pathname, sanitizedPathname]);

  const state = useMemo(() => ({ sanitizedPathname: sanitizedPathname || 'home' }), [sanitizedPathname]);

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

  const actions = useMemo(() => ({
    getVisitedPagesLength,
    handleNavigationScrollPosition,
  }), [getVisitedPagesLength, handleNavigationScrollPosition]);

  return (
    <NavigationStateContext.Provider value={state}>
      <NavigationActionsContext.Provider value={actions}>
        {children}
      </NavigationActionsContext.Provider>
    </NavigationStateContext.Provider>
  );
});

export default GalleryNavigationContextProvider;


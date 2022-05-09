import {
  createContext,
  memo,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import GlobalFooter from 'components/core/Page/GlobalFooter';
import GlobalNavbar from 'components/core/Page/GlobalNavbar/GlobalNavbar';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { GlobalLayoutContextQuery } from '__generated__/GlobalLayoutContextQuery.graphql';
import styled from 'styled-components';
import usePrevious from 'hooks/usePrevious';
import { GLOBAL_NAVBAR_HEIGHT } from 'components/core/Page/constants';
import useDebounce from 'hooks/useDebounce';

type GlobalLayoutState = {
  isNavbarVisible: boolean;
  wasNavbarVisible: boolean;
  isPageTransitioningRef: MutableRefObject<boolean>;
};

const GlobalLayoutStateContext = createContext<GlobalLayoutState | undefined>(undefined);

export const useGlobalLayoutState = (): GlobalLayoutState => {
  const context = useContext(GlobalLayoutStateContext);
  if (!context) {
    throw new Error('Attempted to use GlobalLayoutStateContext without a provider!');
  }

  return context;
};

type GlobalLayoutActions = {
  setNavbarVisible: (b: boolean) => void;
  setFooterVisible: (b: boolean) => void;
};

const GlobalLayoutActionsContext = createContext<GlobalLayoutActions | undefined>(undefined);

export const useGlobalLayoutActions = (): GlobalLayoutActions => {
  const context = useContext(GlobalLayoutActionsContext);
  if (!context) {
    throw new Error('Attempted to use GlobalLayoutActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

// function getFormattedDate() {
//   var date = new Date();

//   var month = date.getMonth() + 1;
//   var day = date.getDate();
//   var hour = date.getHours();
//   var min = date.getMinutes();
//   var sec = date.getSeconds();
//   var ms = date.getMilliseconds();

//   month = (month < 10 ? '0' : '') + month;
//   day = (day < 10 ? '0' : '') + day;
//   hour = (hour < 10 ? '0' : '') + hour;
//   min = (min < 10 ? '0' : '') + min;
//   sec = (sec < 10 ? '0' : '') + sec;
//   // ms = (ms < 10 ? '0' : '') + ms;

//   var str = min + ':' + sec + ':' + ms;

//   /*alert(str);*/

//   return str;
// }

const GlobalLayoutContextProvider = memo(({ children }: Props) => {
  const query = useLazyLoadQuery<GlobalLayoutContextQuery>(
    graphql`
      query GlobalLayoutContextQuery {
        ...GlobalNavbarFragment
      }
    `,
    {}
  );

  const [isNavbarVisible, setNavbarVisible] = useState(false);
  const debouncedNavbarVisible = useDebounce(isNavbarVisible, 200);
  const [footerVisible, setFooterVisible] = useState(false);

  // storing this in ref to prevent triggering unnecessary re-renders / side-effects
  const isPageTransitioningRef = useRef(false);

  const wasNavbarVisible = usePrevious(debouncedNavbarVisible) ?? false;

  // console.log('parent', { isNavbarVisible: debouncedNavbarVisible, wasNavbarVisible });

  const state = useMemo(
    () => ({ isNavbarVisible: debouncedNavbarVisible, wasNavbarVisible, isPageTransitioningRef }),
    [debouncedNavbarVisible, wasNavbarVisible]
  );

  const [forcedHiddenByRoute, setForcedHiddenByRoute] = useState(false);
  const [fadeType, setFadeType] = useState<FadeTriggerType>('route');

  const fadeNavbarOnScroll = useCallback(() => {
    // handle override. the route gets ultimate power over whether the navbar is displayed
    if (forcedHiddenByRoute) {
      return;
    }
    // if we're mid-page transition, don't trigger any scroll-related side effects
    if (isPageTransitioningRef.current) {
      return;
    }
    // console.log(
    //   getFormattedDate(),
    //   'isPageTransitioningRef on scroll',
    //   isPageTransitioningRef.current
    // );
    // console.log(
    //   getFormattedDate(),
    //   'scroll setting visible',
    //   window.scrollY,
    //   window.scrollY <= GLOBAL_NAVBAR_HEIGHT
    // );
    setNavbarVisible(window.scrollY <= GLOBAL_NAVBAR_HEIGHT);
    setFadeType('scroll');
  }, [forcedHiddenByRoute]);

  useEffect(() => {
    window.addEventListener('scroll', fadeNavbarOnScroll);
    return () => {
      window.removeEventListener('scroll', fadeNavbarOnScroll);
    };
  }, [fadeNavbarOnScroll]);

  const handleSetNavbarVisibleFromGalleryRoute = useCallback((visible: boolean) => {
    setNavbarVisible(visible);
    setFadeType('route');
    setForcedHiddenByRoute(!visible);
    // console.log(getFormattedDate(), 'nav setting visible', visible);
  }, []);

  const actions: GlobalLayoutActions = useMemo(
    () => ({
      setNavbarVisible: handleSetNavbarVisibleFromGalleryRoute,
      setFooterVisible,
    }),
    [handleSetNavbarVisibleFromGalleryRoute, setFooterVisible]
  );

  return (
    <>
      <VisibilityFader visible={debouncedNavbarVisible} fadeType={fadeType}>
        <GlobalNavbar queryRef={query} />
      </VisibilityFader>
      <GlobalLayoutStateContext.Provider value={state}>
        <GlobalLayoutActionsContext.Provider value={actions}>
          {children}
        </GlobalLayoutActionsContext.Provider>
      </GlobalLayoutStateContext.Provider>
      <VisibilityFader visible={footerVisible} fadeType={fadeType}>
        <GlobalFooter />
      </VisibilityFader>
    </>
  );
});

type VisibilityFaderProps = {
  children: ReactNode;
  visible: boolean;
  fadeType: FadeTriggerType;
};

type FadeTriggerType = 'route' | 'scroll';

function VisibilityFader({ children, visible, fadeType }: VisibilityFaderProps) {
  const wasVisible = usePrevious(visible) ?? false;

  const transitionStyles = useMemo(() => {
    // FADING OUT
    // always fade out navbar without delay
    if (wasVisible) {
      return 'opacity 300ms ease-in-out;';
    }

    // FADING IN
    if (!wasVisible) {
      // if scrolling, fade-in navbar without delay
      if (fadeType === 'scroll') {
        return 'opacity 300ms ease-in-out';
      }
      // if moving between routes, fade-in navbar with delay
      if (fadeType === 'route') {
        return 'opacity 300ms ease-in-out 700ms';
      }
    }
  }, [wasVisible, fadeType]);

  return (
    <StyledVisibilityFader isVisible={visible} transitionStyles={transitionStyles}>
      {children}
    </StyledVisibilityFader>
  );
}

const StyledVisibilityFader = styled.div<{
  isVisible: boolean;
  transitionStyles?: string;
}>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: ${({ transitionStyles }) => transitionStyles};
  // if pointer-events is set to none, it will *not* prevent elements beneath
  // the navbar from being clickable since the navbar is position:fixed, and
  // does not cause the parent to have any height.
  // TL;DR – WE GOOD
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
`;

export default GlobalLayoutContextProvider;

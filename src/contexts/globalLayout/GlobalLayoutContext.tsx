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

// the action that causes the fade
type FadeTriggerType = 'route' | 'scroll' | 'hover';

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

type useNavbarControlsProps = {
  isPageTransitioningRef: GlobalLayoutState['isPageTransitioningRef'];
};

function useNavbarControls({ isPageTransitioningRef }: useNavbarControlsProps) {
  const [isNavbarVisible, setNavbarVisible] = useState(false);
  const debouncedNavbarVisible = useDebounce(isNavbarVisible, 200);
  const wasNavbarVisible = usePrevious(debouncedNavbarVisible) ?? false;

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

  const handleFadeNavbarFromGalleryRoute = useCallback((visible: boolean) => {
    setNavbarVisible(visible);
    setFadeType('route');
    setForcedHiddenByRoute(!visible);
    console.log(getFormattedDate(), 'nav setting visible', visible);
  }, []);

  const handleFadeNavbarOnHover = useCallback((visible: boolean) => {
    setNavbarVisible(visible);
    setFadeType('hover');
  }, []);

  return useMemo(
    () => ({
      isNavbarVisible: debouncedNavbarVisible,
      wasNavbarVisible,
      fadeType,
      handleFadeNavbarFromGalleryRoute,
      handleFadeNavbarOnHover,
    }),
    [debouncedNavbarVisible, wasNavbarVisible, fadeType, handleFadeNavbarFromGalleryRoute]
  );
}

const GlobalLayoutContextProvider = memo(({ children }: Props) => {
  // storing this in ref to prevent triggering unnecessary re-renders / side-effects
  const isPageTransitioningRef = useRef(false);

  const {
    isNavbarVisible,
    wasNavbarVisible,
    fadeType,
    handleFadeNavbarFromGalleryRoute,
    handleFadeNavbarOnHover,
  } = useNavbarControls({
    isPageTransitioningRef,
  });

  const [isFooterVisible, setFooterVisible] = useState(false);
  const wasFooterVisible = usePrevious(isFooterVisible) ?? false;

  const state = useMemo(
    () => ({ isNavbarVisible, wasNavbarVisible, isPageTransitioningRef }),
    [isNavbarVisible, wasNavbarVisible]
  );

  const actions: GlobalLayoutActions = useMemo(
    () => ({
      setNavbarVisible: handleFadeNavbarFromGalleryRoute,
      setFooterVisible,
    }),
    [handleFadeNavbarFromGalleryRoute, setFooterVisible]
  );

  return (
    <>
      <GlobalNavbarWithFadeEnabled
        isVisible={isNavbarVisible}
        wasVisible={wasNavbarVisible}
        fadeType={fadeType}
        handleFadeNavbarOnHover={handleFadeNavbarOnHover}
      />

      <GlobalLayoutStateContext.Provider value={state}>
        <GlobalLayoutActionsContext.Provider value={actions}>
          {children}
        </GlobalLayoutActionsContext.Provider>
      </GlobalLayoutStateContext.Provider>

      <GlobalFooterWithFadeEnabled
        isVisible={isFooterVisible}
        wasVisible={wasFooterVisible}
        fadeType={fadeType}
      />
    </>
  );
});

type GlobalNavbarWithFadeEnabledProps = {
  isVisible: boolean;
  wasVisible: boolean;
  fadeType: FadeTriggerType;
  handleFadeNavbarOnHover: (visible: boolean) => void;
};

function GlobalNavbarWithFadeEnabled({
  isVisible,
  wasVisible,
  fadeType,
  handleFadeNavbarOnHover,
}: GlobalNavbarWithFadeEnabledProps) {
  const query = useLazyLoadQuery<GlobalLayoutContextQuery>(
    graphql`
      query GlobalLayoutContextQuery {
        ...GlobalNavbarFragment
      }
    `,
    {}
  );

  const transitionStyles = useMemo(() => {
    // FADING OUT
    // always fade out navbar without delay
    if (wasVisible) {
      return 'opacity 300ms ease-in-out;';
    }

    // FADING IN
    if (!wasVisible) {
      // if scrolling, fade-in navbar without delay
      if (fadeType === 'scroll' || fadeType == 'hover') {
        return 'opacity 300ms ease-in-out';
      }
      // if moving between routes, fade-in navbar with delay
      if (fadeType === 'route') {
        return 'opacity 300ms ease-in-out 700ms';
      }
    }
  }, [wasVisible, fadeType]);

  const handleMouseEnter = useCallback(
    () => handleFadeNavbarOnHover(true),
    [handleFadeNavbarOnHover]
  );

  const handleMouseLeave = useCallback(
    () => handleFadeNavbarOnHover(false),
    [handleFadeNavbarOnHover]
  );

  return (
    <StyledGlobalNavbarWithFadeEnabled
      isVisible={isVisible}
      transitionStyles={transitionStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <GlobalNavbar queryRef={query} />
    </StyledGlobalNavbarWithFadeEnabled>
  );
}

const StyledGlobalNavbarWithFadeEnabled = styled.div<{
  isVisible: boolean;
  transitionStyles?: string;
}>`
  // border: 2px solid yellow;
  backgound: pink;

  position: fixed;
  width: 100%;
  height: ${GLOBAL_NAVBAR_HEIGHT}px;
  z-index: 1;

  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: ${({ transitionStyles }) => transitionStyles};

  // prevent nav child elements from being clickable when not in view
  > div > div {
    pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  }
`;

type GlobalFooterWithFadeEnabledProps = {
  isVisible: boolean;
  wasVisible: boolean;
  fadeType: FadeTriggerType;
};

function GlobalFooterWithFadeEnabled({
  isVisible,
  wasVisible,
  fadeType,
}: GlobalFooterWithFadeEnabledProps) {
  const transitionStyles = useMemo(() => {
    // FADING OUT
    // always fade out navbar without delay
    if (wasVisible) {
      return 'opacity 300ms ease-in-out;';
    }

    // FADING IN
    if (!wasVisible) {
      // if scrolling, fade-in navbar without delay
      if (fadeType === 'scroll' || fadeType == 'hover') {
        return 'opacity 300ms ease-in-out';
      }
      // if moving between routes, fade-in navbar with delay
      if (fadeType === 'route') {
        return 'opacity 300ms ease-in-out 700ms';
      }
    }
  }, [wasVisible, fadeType]);

  return (
    <StyledGlobalFooterWithFadeEnabled isVisible={isVisible} transitionStyles={transitionStyles}>
      <GlobalFooter />
    </StyledGlobalFooterWithFadeEnabled>
  );
}

const StyledGlobalFooterWithFadeEnabled = styled.div<{
  isVisible: boolean;
  transitionStyles?: string;
}>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: ${({ transitionStyles }) => transitionStyles};
`;

export default GlobalLayoutContextProvider;

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
import { graphql } from 'relay-runtime';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import { GlobalLayoutContextQuery } from '__generated__/GlobalLayoutContextQuery.graphql';
import styled from 'styled-components';
import usePrevious from 'hooks/usePrevious';
import useDebounce from 'hooks/useDebounce';
import isTouchscreenDevice from 'utils/isTouchscreenDevice';
import { isFeatureEnabled } from 'utils/featureFlag';
import { FeatureFlag } from 'components/core/enums';
import PosterBanner from 'scenes/PosterPage/PosterBanner';
import GlobalNavbar, { GLOBAL_NAVBAR_HEIGHT } from './GlobalNavbar/GlobalNavbar';
import Banner from './GlobalBanner/GlobalBanner';
import { GlobalLayoutContextNavbarFragment$key } from '__generated__/GlobalLayoutContextNavbarFragment.graphql';

type GlobalLayoutState = {
  isNavbarVisible: boolean;
  wasNavbarVisible: boolean;
  isPageInSuspenseRef: MutableRefObject<boolean>;
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
  setBannerVisible: (b: boolean) => void;
  setNavbarVisible: (b: boolean) => void;
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

function getFormattedDate() {
  var date = new Date();

  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var min = date.getMinutes();
  var sec = date.getSeconds();
  var ms = date.getMilliseconds();

  month = (month < 10 ? '0' : '') + month;
  day = (day < 10 ? '0' : '') + day;
  hour = (hour < 10 ? '0' : '') + hour;
  min = (min < 10 ? '0' : '') + min;
  sec = (sec < 10 ? '0' : '') + sec;
  // ms = (ms < 10 ? '0' : '') + ms;

  var str = min + ':' + sec + ':' + ms;

  /*alert(str);*/

  return str;
}

type useNavbarControlsProps = {
  isPageInSuspenseRef: GlobalLayoutState['isPageInSuspenseRef'];
};

function useNavbarControls({ isPageInSuspenseRef }: useNavbarControlsProps) {
  const [isNavbarVisible, setNavbarVisible] = useState(false);
  const debouncedNavbarVisible = useDebounce(isNavbarVisible, 300);
  const wasNavbarVisible = usePrevious(debouncedNavbarVisible) ?? false;

  const [fadeType, setFadeType] = useState<FadeTriggerType>('route');

  const forcedHiddenByRouteRef = useRef(false);

  const isTouchscreen = useRef(isTouchscreenDevice());

  /**
   * There is a race condition that arises if a scroll-based fade is triggered
   * immediately after a route-based fade. We use a timestamp to determine whether
   * a fade was recently triggered by route change.
   */
  const lastFadeTriggeredByRouteTimestampRef = useRef(0);

  const fadeNavbarOnScroll = useCallback(() => {
    // handle override. the route gets ultimate power over whether the navbar is displayed
    if (forcedHiddenByRouteRef.current) {
      return;
    }
    // if we recently triggered a route transition, ignore scroll-related side effects
    if (Date.now() - lastFadeTriggeredByRouteTimestampRef.current < 100) {
      return;
    }
    // if we're mid-suspense, don't trigger any scroll-related side effects
    if (isPageInSuspenseRef.current) {
      return;
    }
    // console.log(getFormattedDate(), 'isPageInSuspenseRef on scroll', isPageInSuspenseRef.current);
    // console.log(
    //   getFormattedDate(),
    //   'scroll setting visible',
    //   window.scrollY,
    //   window.scrollY <= GLOBAL_NAVBAR_HEIGHT
    // );
    setNavbarVisible(window.scrollY <= GLOBAL_NAVBAR_HEIGHT);
    setFadeType('scroll');
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', fadeNavbarOnScroll);
    return () => {
      window.removeEventListener('scroll', fadeNavbarOnScroll);
    };
  }, [fadeNavbarOnScroll]);

  const handleFadeNavbarFromGalleryRoute = useCallback((visible: boolean) => {
    setNavbarVisible(visible);
    setFadeType('route');

    forcedHiddenByRouteRef.current = !visible;
    lastFadeTriggeredByRouteTimestampRef.current = Date.now();

    // console.log(lastFadeTriggeredByRouteTimestampRef.current);
    // console.log(getFormattedDate(), 'nav setting visible', visible);
  }, []);

  // console.log(getFormattedDate(), { isNavbarVisible, wasNavbarVisible, debouncedNavbarVisible });

  const handleFadeNavbarOnHover = useCallback((visible: boolean) => {
    // prevent navbar from being accessible via touch-based hover; otherwise, users trying
    // to click something near the top of the screen will trigger the navbar instead
    if (isTouchscreen.current) {
      return;
    }

    // prevent navbar from fading out if user is near the top of the page
    // console.log(getFormattedDate(), 'hover setting visible', visible);
    if (!visible && window.scrollY <= GLOBAL_NAVBAR_HEIGHT) {
      return;
    }

    // handle override. the route gets ultimate power over whether the navbar is displayed
    if (forcedHiddenByRouteRef.current) {
      return;
    }
    // if we recently triggered a route transition, ignore scroll-related side effects
    if (Date.now() - lastFadeTriggeredByRouteTimestampRef.current < 100) {
      return;
    }
    // if we're mid-suspense, don't trigger any scroll-related side effects
    if (isPageInSuspenseRef.current) {
      return;
    }
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
    [
      debouncedNavbarVisible,
      wasNavbarVisible,
      fadeType,
      handleFadeNavbarFromGalleryRoute,
      handleFadeNavbarOnHover,
    ]
  );
}

const GlobalLayoutContextProvider = memo(({ children }: Props) => {
  // storing this in ref to prevent triggering unnecessary re-renders / side-effects
  const isPageInSuspenseRef = useRef(false);

  const {
    isNavbarVisible,
    wasNavbarVisible,
    fadeType,
    handleFadeNavbarFromGalleryRoute,
    handleFadeNavbarOnHover,
  } = useNavbarControls({
    isPageInSuspenseRef,
  });

  const state = useMemo(
    () => ({ isNavbarVisible, wasNavbarVisible, isPageInSuspenseRef }),
    [isNavbarVisible, wasNavbarVisible]
  );

  const [isBannerVisible, setBannerVisible] = useState(false);

  const actions: GlobalLayoutActions = useMemo(
    () => ({
      setBannerVisible,
      setNavbarVisible: handleFadeNavbarFromGalleryRoute,
    }),
    [handleFadeNavbarFromGalleryRoute]
  );

  const query = useLazyLoadQuery<GlobalLayoutContextQuery>(
    graphql`
      query GlobalLayoutContextQuery {
        ...GlobalLayoutContextNavbarFragment
      }
    `,
    {}
  );

  return (
    // note: we render the navbar here, above the main contents of the app,
    // so that it can remain fixed across page transitions. the footer, on
    // the other hand, is rendered at `GalleryRoute`.
    <>
      <GlobalNavbarWithFadeEnabled
        queryRef={query}
        isVisible={isNavbarVisible}
        isBannerVisible={isBannerVisible}
        wasVisible={wasNavbarVisible}
        fadeType={fadeType}
        handleFadeNavbarOnHover={handleFadeNavbarOnHover}
      />

      <GlobalLayoutStateContext.Provider value={state}>
        <GlobalLayoutActionsContext.Provider value={actions}>
          {children}
        </GlobalLayoutActionsContext.Provider>
      </GlobalLayoutStateContext.Provider>
    </>
  );
});

type GlobalNavbarWithFadeEnabledProps = {
  queryRef: GlobalLayoutContextNavbarFragment$key;
  isVisible: boolean;
  isBannerVisible: boolean;
  wasVisible: boolean;
  fadeType: FadeTriggerType;
  handleFadeNavbarOnHover: (visible: boolean) => void;
};

function GlobalNavbarWithFadeEnabled({
  queryRef,
  isVisible,
  wasVisible,
  isBannerVisible,
  fadeType,
  handleFadeNavbarOnHover,
}: GlobalNavbarWithFadeEnabledProps) {
  const query = useFragment(
    graphql`
      fragment GlobalLayoutContextNavbarFragment on Query {
        ...GlobalNavbarFragment
        ...GlobalBannerFragment
      }
    `,
    queryRef
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
      if (fadeType === 'scroll' || fadeType === 'hover') {
        return 'opacity 300ms ease-in-out';
      }
      // if moving between routes, fade-in navbar with delay
      if (fadeType === 'route') {
        return 'opacity 300ms ease-in-out 700ms';
      }
    }
  }, [wasVisible, fadeType]);

  // for touch-enabled devices, we need to keep the upper area of the screen clickable.
  // this is normally as simple as setting the navbar z-index to 0, but doing so right
  // away makes it look like the navbar immediately disappears; therefore we need to
  // delay until the navbar is out of site.
  const isTouchscreen = useRef(isTouchscreenDevice());
  const [zIndex, setZIndex] = useState(2);
  useEffect(() => {
    if (!isVisible && isTouchscreen.current) {
      setTimeout(() => setZIndex(0), 300);
    }
    setZIndex(2);
  }, [isVisible]);

  const handleMouseEnter = useCallback(
    () => handleFadeNavbarOnHover(true),
    [handleFadeNavbarOnHover]
  );

  const handleMouseLeave = useCallback(
    () => handleFadeNavbarOnHover(false),
    [handleFadeNavbarOnHover]
  );

  return (
    <>
      <StyledGlobalNavbarWithFadeEnabled
        isVisible={isVisible}
        transitionStyles={transitionStyles}
        zIndex={zIndex}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {isBannerVisible ? (
          isFeatureEnabled(FeatureFlag.POSTER_PAGE) ? (
            <PosterBanner queryRef={query} />
          ) : (
            <Banner text="" queryRef={query} />
          )
        ) : null}
        <GlobalNavbar queryRef={query} />
      </StyledGlobalNavbarWithFadeEnabled>
    </>
  );
}

const StyledGlobalNavbarWithFadeEnabled = styled.div<{
  isVisible: boolean;
  transitionStyles?: string;
  zIndex: number;
}>`
  position: fixed;
  width: 100%;
  height: ${GLOBAL_NAVBAR_HEIGHT}px;
  z-index: ${({ zIndex }) => zIndex};

  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: ${({ transitionStyles }) => transitionStyles};

  // prevent nav child elements from being clickable when not in view
  > div > div {
    pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  }
`;

export default GlobalLayoutContextProvider;

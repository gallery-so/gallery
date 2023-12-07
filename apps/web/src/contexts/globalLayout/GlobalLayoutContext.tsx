/* eslint-disable @typescript-eslint/no-unused-vars */
import { AnimatePresence, motion } from 'framer-motion';
import {
  createContext,
  memo,
  ReactElement,
  ReactNode,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { loadQuery, PreloadedQuery, useFragment, usePreloadedQuery } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import FullPageLoader from '~/components/core/Loader/FullPageLoader';
import { UpsellBanner } from '~/components/UpsellBanner/UpsellBanner';
import { useGlobalNavbarHeight } from '~/contexts/globalLayout/GlobalNavbar/useGlobalNavbarHeight';
import { GlobalLayoutContextNavbarFragment$key } from '~/generated/GlobalLayoutContextNavbarFragment.graphql';
import { GlobalLayoutContextQuery } from '~/generated/GlobalLayoutContextQuery.graphql';
import usePrevious from '~/hooks/usePrevious';
import useThrottle from '~/hooks/useThrottle';
import useDebounce from '~/shared/hooks/useDebounce';
import useExperience from '~/shared/hooks/useExperience';
import colors from '~/shared/theme/colors';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';
import isTouchscreenDevice from '~/utils/isTouchscreenDevice';

import { FEATURED_COLLECTION_IDS } from './GlobalAnnouncementPopover/GlobalAnnouncementPopover';
import useGlobalAnnouncementPopover from './GlobalAnnouncementPopover/useGlobalAnnouncementPopover';
import MobileBetaUpsell from './GlobalBanner/MobileBetaUpsell';
import {
  UpcomingMaintenanceBanner,
  useUpcomingMaintenanceBannerWeb,
} from './GlobalBanner/UpcomingMaintenanceBanner';
import GlobalSidebar, { GLOBAL_SIDEBAR_DESKTOP_WIDTH } from './GlobalSidebar/GlobalSidebar';
import {
  FADE_TRANSITION_TIME_MS,
  FADE_TRANSITION_TIME_SECONDS,
  NAVIGATION_TRANSITION_TIME_SECONDS,
} from './transitionTiming';
import useStabilizedRouteTransitionKey from './useStabilizedRouteTransitionKey';

type GlobalLayoutState = {
  isNavbarVisible: boolean;
  wasNavbarVisible: boolean;
};

export const GlobalLayoutStateContext = createContext<GlobalLayoutState | undefined>(undefined);

export const useGlobalLayoutState = (): GlobalLayoutState => {
  const context = useContext(GlobalLayoutStateContext);
  if (!context) {
    throw new Error('Attempted to use GlobalLayoutStateContext without a provider!');
  }

  return context;
};

type GlobalLayoutActions = {
  setIsBannerVisible: (b: boolean) => void;
  setTopNavContent: (e: ReactElement | null) => void;
  setSidebarContent: (e: ReactElement | null) => void;
};

const GlobalLayoutActionsContext = createContext<GlobalLayoutActions | undefined>(undefined);

export const useGlobalLayoutActions = (): GlobalLayoutActions => {
  const context = useContext(GlobalLayoutActionsContext);
  if (!context) {
    throw new Error('Attempted to use GlobalLayoutActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode; preloadedQuery: PreloadedQuery<GlobalLayoutContextQuery> };

// the action that triggered the fade animation
type FadeTriggerType = 'route' | 'scroll' | 'hover';

const GlobalLayoutContextQueryNode = graphql`
  # query GlobalLayoutContextQuery($collectionIds: [DBID!]!) {
  query GlobalLayoutContextQuery {
    ...GlobalLayoutContextNavbarFragment
    # Keeping this around for the next time we want to use it
    ...useGlobalAnnouncementPopoverFragment
  }
`;

const GlobalLayoutContextProvider = memo(({ children, preloadedQuery }: Props) => {
  const query = usePreloadedQuery<GlobalLayoutContextQuery>(
    GlobalLayoutContextQueryNode,
    preloadedQuery
  );

  // whether the global banner is visible
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const navbarHeight = useGlobalNavbarHeight();

  /**
   * the action that triggered the fade animation.
   *
   * there are 3 types of triggers:
   * - route-based setting determined by `GalleryRoute.tsx`
   * - scroll-based setting determined by scroll position
   * - hover-based setting determined by mouse position
   */
  const [fadeType, setFadeType] = useState<FadeTriggerType>('route');

  // Each individual route is responsible for dictating what content to display
  const [topNavContent, setTopNavContent] = useState<ReactElement | null>(null);
  const [sidebarContent, setSidebarContent] = useState<ReactElement | null>(null);

  /**
   * navbar-related states.
   *
   * - `isNavbarEnabled` is the raw state that's set by "dumb" components / interactions
   *   that simply wanna display / hide the nav, according to its internal logic
   * - we then need to `debounce` or `throttle` this state because many interactions could be
   *   fighting to set this state
   * - the difference between debouncing vs. throttling comes down to whether we need to
   *   delay the navbar fade animation vs. display it immediately, respectively.
   * - `wasNavbarVisible` is used to determine whether we should continue displaying the navbar
   *   across transitions. for example, if the user navigates from /a => /b and the navbar
   *   is visible in both scenarios, we should keep it in view, without any fade animations.
   */
  const [isNavbarEnabled, setIsNavbarEnabled] = useState(true);
  const debounced = useDebounce(isNavbarEnabled, FADE_TRANSITION_TIME_MS);
  const throttled = useThrottle(isNavbarEnabled, FADE_TRANSITION_TIME_MS);

  const isNavbarVisible = useMemo(() => {
    // prevents navbar from flickering before route transition is complete
    if (fadeType === 'route') {
      return debounced;
    }
    return throttled;
  }, [fadeType, throttled, debounced]);
  const wasNavbarVisible = usePrevious(isNavbarVisible) ?? false;

  // whether the route wants the navbar disabled. this is an override where scrolling / hovering
  // will not make the navbar appear
  const forcedHiddenByRouteRef = useRef(false);

  // touchscreen devices will have different behavior
  const isTouchscreen = useRef(isTouchscreenDevice());

  /**
   * There is a race condition that arises if a scroll-based fade is triggered immediately after
   * a route-based fade, causing the nav to appear prematurely. We use a timestamp to determine
   * whether an animation was recently triggered by route change. (For some reason, this bug
   * couldn't be fixed with throttling)
   */
  const lastFadeTriggeredByRouteTimestampRef = useRef(0);

  //-------------- ROUTE ---------------
  const handleFadeNavbarFromGalleryRoute = useCallback(
    (content: ReactElement | null) => {
      setFadeType('route');
      setIsNavbarEnabled(Boolean(content) && window.scrollY <= navbarHeight);
      forcedHiddenByRouteRef.current = !content;
      lastFadeTriggeredByRouteTimestampRef.current = Date.now();
      // set nav content after a delay so the current content has a chance to fade out first
      // TODO: try to get this to work using framer motion + locationKey
      setTimeout(() => {
        setTopNavContent(content);
      }, FADE_TRANSITION_TIME_MS + 100);
    },
    [navbarHeight]
  );

  //-------------- SCROLL --------------
  const handleFadeNavbarOnScroll = useCallback(() => {
    // the route gets ultimate override over whether the navbar is displayed
    if (forcedHiddenByRouteRef.current) {
      return;
    }
    // if we recently triggered a route transition, ignore scroll-related side effects
    if (Date.now() - lastFadeTriggeredByRouteTimestampRef.current < 200) {
      return;
    }

    setFadeType('scroll');
    setIsNavbarEnabled(window.scrollY <= navbarHeight);
  }, [navbarHeight]);

  useEffect(() => {
    window.addEventListener('scroll', handleFadeNavbarOnScroll);
    return () => {
      window.removeEventListener('scroll', handleFadeNavbarOnScroll);
    };
  }, [handleFadeNavbarOnScroll]);

  //-------------- HOVER ---------------
  const handleFadeNavbarOnHover = useCallback(
    (visible: boolean) => {
      // handle override. the route gets ultimate power over whether the navbar is displayed
      if (forcedHiddenByRouteRef.current) {
        return;
      }
      // if we recently triggered a route transition, ignore hover-related side effects
      if (Date.now() - lastFadeTriggeredByRouteTimestampRef.current < 100) {
        return;
      }
      // prevent touchscreen users from triggering the navbar by tapping near the top of the screen
      if (isTouchscreen.current) {
        return;
      }
      // prevent nav from fading out if user is near the top of the page and hovers in/out of nav area
      if (!visible && window.scrollY <= navbarHeight) {
        return;
      }

      setFadeType('hover');
      setIsNavbarEnabled(visible);
    },
    [navbarHeight]
  );

  const state = useMemo(
    () => ({ isNavbarVisible, wasNavbarVisible }),
    [isNavbarVisible, wasNavbarVisible]
  );

  const actions: GlobalLayoutActions = useMemo(
    () => ({
      setIsBannerVisible,
      setTopNavContent: handleFadeNavbarFromGalleryRoute,
      setSidebarContent,
    }),
    [handleFadeNavbarFromGalleryRoute]
  );

  // Keeping this around for the next time we want to use it
  useGlobalAnnouncementPopover({ queryRef: query, authRequired: false, dismissVariant: 'global' });

  const locationKey = useStabilizedRouteTransitionKey();

  const isSidebarPresent = sidebarContent !== null;

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
        content={topNavContent}
        isSidebarPresent={isSidebarPresent}
      />

      <AnimatePresence>
        {isSidebarPresent && (
          <StyledGlobalSidebarMotion
            key={locationKey}
            transition={{
              ease: 'easeInOut',
              duration: FADE_TRANSITION_TIME_SECONDS,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlobalSidebar content={sidebarContent} />
          </StyledGlobalSidebarMotion>
        )}
      </AnimatePresence>

      <MainContentWrapper isSidebarPresent={isSidebarPresent}>
        <GlobalLayoutStateContext.Provider value={state}>
          <GlobalLayoutActionsContext.Provider value={actions}>
            {/*
             * Fade main page content as the user navigates across routes.
             * This does not affect the Top Nav or Left Hand Nav.
             */}
            <AnimatePresence>
              <motion.div
                key={locationKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  transition: { duration: FADE_TRANSITION_TIME_SECONDS },
                }}
                transition={{
                  ease: 'easeInOut',
                  delay: NAVIGATION_TRANSITION_TIME_SECONDS,
                  duration: FADE_TRANSITION_TIME_SECONDS,
                }}
              >
                <Suspense fallback={<FullPageLoader />}>{children}</Suspense>
              </motion.div>
            </AnimatePresence>
          </GlobalLayoutActionsContext.Provider>
        </GlobalLayoutStateContext.Provider>
      </MainContentWrapper>
    </>
  );
});

const MainContentWrapper = styled.div<{ isSidebarPresent: boolean }>`
  transition: margin-left ${FADE_TRANSITION_TIME_SECONDS}s ease-in-out;

  @media only screen and ${breakpoints.tablet} {
    ${({ isSidebarPresent }) =>
      isSidebarPresent && ` margin-left: ${GLOBAL_SIDEBAR_DESKTOP_WIDTH}px;`}
  }
`;

const StyledGlobalSidebarMotion = styled(motion.div)`
  position: relative;
  z-index: 2; // ensure sidebar sits above navbar
`;

GlobalLayoutContextProvider.preloadQuery = ({ relayEnvironment }: PreloadQueryArgs) => {
  return loadQuery<GlobalLayoutContextQuery>(
    relayEnvironment,
    GlobalLayoutContextQueryNode,
    {
      collectionIds: FEATURED_COLLECTION_IDS,
    },
    { fetchPolicy: 'store-or-network' }
  );
};

GlobalLayoutContextProvider.displayName = 'GlobalLayoutContextProvider';

type GlobalNavbarWithFadeEnabledProps = {
  queryRef: GlobalLayoutContextNavbarFragment$key;
  isVisible: boolean;
  wasVisible: boolean;
  handleFadeNavbarOnHover: (visible: boolean) => void;
  fadeType: FadeTriggerType;
  isBannerVisible: boolean;
  content: ReactElement | null;
  isSidebarPresent: boolean;
};

function GlobalNavbarWithFadeEnabled({
  queryRef,
  isVisible,
  handleFadeNavbarOnHover,
  fadeType,
  isBannerVisible,
  content,
  isSidebarPresent,
}: GlobalNavbarWithFadeEnabledProps) {
  const query = useFragment(
    graphql`
      fragment GlobalLayoutContextNavbarFragment on Query {
        viewer {
          ... on Viewer {
            __typename
            user {
              ... on GalleryUser {
                primaryWallet {
                  __typename
                }
              }
            }
          }
        }
        ...MobileBetaUpsellFragment
        ...UpsellBannerQuery
        ...UpcomingMaintenanceBannerFragment
        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const isLoggedInAndDoesNotHaveWallet =
    query.viewer?.__typename === 'Viewer' && !query.viewer.user?.primaryWallet;

  const {
    shouldDisplayBanner: shouldDisplayMaintenanceBanner,
    handleDismissBanner,
    maintenanceId,
    message,
  } = useUpcomingMaintenanceBannerWeb();

  const MOBILE_BETA_UPSELL_FLAG = 'MobileBetaUpsell';

  const [isMobileUpsellBannerExperienced] = useExperience({
    type: MOBILE_BETA_UPSELL_FLAG,
    queryRef: query,
  });

  const displayedBanner = useMemo(() => {
    // maintenance banner should display over any other type of banner since it's a rare occurrence
    if (shouldDisplayMaintenanceBanner) {
      return (
        <UpcomingMaintenanceBanner
          queryRef={query}
          handleDismissBanner={handleDismissBanner}
          maintenanceId={maintenanceId}
          message={message}
        />
      );
    }

    if (isLoggedInAndDoesNotHaveWallet) {
      return <UpsellBanner queryRef={query} />;
    }

    if (isBannerVisible) {
      if (!isMobileUpsellBannerExperienced) {
        return (
          <MobileBetaUpsell
            experienceFlag={MOBILE_BETA_UPSELL_FLAG}
            text="Embrace the new era of creativity at Gallery! Download the Gallery Mobile App Beta and take your collection everywhere."
            dismissOnActionComponentClick
            queryRef={query}
            requireAuth
          />
        );
      }

      // TODO: this should ideally be controlled through Sanity
      // return <LocalStorageGlobalBanner />;
    }

    return null;
  }, [
    handleDismissBanner,
    isBannerVisible,
    isLoggedInAndDoesNotHaveWallet,
    isMobileUpsellBannerExperienced,
    maintenanceId,
    message,
    query,
    shouldDisplayMaintenanceBanner,
  ]);

  const isTouchscreen = useRef(isTouchscreenDevice());
  const [zIndex, setZIndex] = useState(2);
  useEffect(() => {
    if (!isVisible) {
      if (
        // for touch-enabled devices, we need to keep the upper area of the screen clickable;
        // without this, users wouldn't be able to click near the top of the device
        isTouchscreen.current ||
        // if the route doesn't want the navbar to be in view, we need to remove it completely
        // so that the user can click on elements where the navbar would be
        fadeType === 'route'
      ) {
        // this is normally as simple as setting the navbar z-index to -1, but doing so right
        // away makes it look like the navbar vanishes immediately; therefore we add a delay
        // until the navbar has already faded out of sight.
        const timeoutId = setTimeout(() => setZIndex(-1), FADE_TRANSITION_TIME_MS);

        return () => clearTimeout(timeoutId);
      }
    }
    setZIndex(2);
  }, [isVisible, fadeType]);

  const handleMouseEnter = useCallback(
    () => handleFadeNavbarOnHover(true),
    [handleFadeNavbarOnHover]
  );

  const handleMouseLeave = useCallback(
    () => handleFadeNavbarOnHover(false),
    [handleFadeNavbarOnHover]
  );

  const navbarHeight = useGlobalNavbarHeight();

  return (
    <StyledGlobalNavbarWithFadeEnabled
      isVisible={isVisible}
      zIndex={zIndex}
      navbarHeight={navbarHeight}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/*
       * Fade navbar as the user navigates across routes.
       * This is tricky because, depending on context, we either want it to:
       * 1) remain stable across route transitions, or
       * 2) synchronize fading with the main content
       */}

      <AnimatePresence>
        {isVisible && (
          <StyledMotionWrapper isSidebarPresent={isSidebarPresent}>
            <motion.div
              className="GlobalNavbar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: FADE_TRANSITION_TIME_SECONDS },
              }}
              transition={{
                ease: 'easeInOut',
                delay: fadeType === 'route' ? NAVIGATION_TRANSITION_TIME_SECONDS : 0,
                duration: FADE_TRANSITION_TIME_SECONDS,
              }}
            >
              {displayedBanner}
              <StyledBackground>{content}</StyledBackground>
            </motion.div>
          </StyledMotionWrapper>
        )}
      </AnimatePresence>
    </StyledGlobalNavbarWithFadeEnabled>
  );
}

const StyledGlobalNavbarWithFadeEnabled = styled.div<{
  isVisible: boolean;
  transitionStyles?: string;
  zIndex: number;
  navbarHeight: number;
}>`
  position: fixed;
  width: 100%;
  z-index: ${({ zIndex }) => zIndex};
  height: ${({ navbarHeight }) => navbarHeight}px;
`;

const StyledBackground = styled.div`
  background: ${colors.white};
  backdrop-filter: blur(48px) opacity(0.95);
`;

const StyledMotionWrapper = styled.div<{ isSidebarPresent: boolean }>`
  transition: margin-left ${FADE_TRANSITION_TIME_SECONDS}s ease-in-out;
  position: relative;

  @media only screen and ${breakpoints.tablet} {
    ${({ isSidebarPresent }) =>
      isSidebarPresent && `margin-left: ${GLOBAL_SIDEBAR_DESKTOP_WIDTH}px;`}
  }
`;

export default GlobalLayoutContextProvider;

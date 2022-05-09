import {
  createContext,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

const GlobalLayoutContextProvider = memo(({ children }: Props) => {
  const query = useLazyLoadQuery<GlobalLayoutContextQuery>(
    graphql`
      query GlobalLayoutContextQuery {
        ...GlobalNavbarFragment
      }
    `,
    {}
  );

  const [navbarVisible, setNavbarVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [forcedHiddenByRoute, setForcedHiddenByRoute] = useState(false);
  const [fadeType, setFadeType] = useState<FadeTriggerType>('route');

  const fadeNavbarOnScroll = useCallback(() => {
    if (forcedHiddenByRoute) {
      return;
    }
    setNavbarVisible(window.scrollY <= GLOBAL_NAVBAR_HEIGHT);
    setFadeType('scroll');
  }, [forcedHiddenByRoute]);

  useEffect(() => {
    window.addEventListener('scroll', fadeNavbarOnScroll);
    return () => window.removeEventListener('scroll', fadeNavbarOnScroll);
  }, [fadeNavbarOnScroll]);

  const handleSetNavbarVisibleFromGalleryRoute = useCallback((visible: boolean) => {
    setNavbarVisible(visible);
    setFadeType('route');
    setForcedHiddenByRoute(!visible);
  }, []);

  const actions: GlobalLayoutActions = useMemo(
    () => ({ setNavbarVisible: handleSetNavbarVisibleFromGalleryRoute, setFooterVisible }),
    [handleSetNavbarVisibleFromGalleryRoute, setFooterVisible]
  );

  return (
    <>
      <VisibilityFader visible={navbarVisible} fadeType={fadeType}>
        <GlobalNavbar queryRef={query} />
      </VisibilityFader>
      <GlobalLayoutActionsContext.Provider value={actions}>
        {children}
      </GlobalLayoutActionsContext.Provider>
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

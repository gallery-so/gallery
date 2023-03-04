import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';

export type DrawerType = 'Notifications' | 'Settings';

type ActiveDrawer = {
  content: ReactElement;
  drawerType?: DrawerType;
};

type DrawerState = {
  activeDrawer: ActiveDrawer | null;
};

const DrawerStateContext = createContext<DrawerState | undefined>(undefined);

export const useDrawerState = (): DrawerState => {
  const context = useContext(DrawerStateContext);
  if (!context) {
    throw new Error('Attempted to use DrawerStateContext without a provider!');
  }

  return context;
};

type DrawerActions = {
  showDrawer: (props: ActiveDrawer) => void;
  hideDrawer: () => void;
};

const DrawerActionsContext = createContext<DrawerActions | undefined>(undefined);

export const useDrawerActions = (): DrawerActions => {
  const context = useContext(DrawerActionsContext);
  if (!context) {
    throw new Error('Attempted to use DrawerActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

function SidebarDrawerProvider({ children }: Props): ReactElement {
  const [drawerState, setDrawerState] = useState<DrawerState>({ activeDrawer: null });
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  /**
   * EFFECT: Prevent main body from being scrollable on mobile when drawer is open. On desktop we allow users to scroll the main body while the drawer is open.
   */
  useEffect(() => {
    if (isMobile) {
      const isDrawerOpen = drawerState.activeDrawer !== null;

      document.body.style.overflow = isDrawerOpen ? 'hidden' : 'unset';
    }
  }, [drawerState.activeDrawer, isMobile]);

  const showDrawer = useCallback((props: ActiveDrawer) => {
    setDrawerState((previous) => {
      // if the same drawer type is already open, close it
      if (previous.activeDrawer?.content.type === props.content.type) {
        return { activeDrawer: null };
      }

      // otherwise, open the new drawer
      return { activeDrawer: props };
    });
  }, []);

  const hideDrawer = useCallback((): void => {
    setDrawerState({ activeDrawer: null });
  }, []);

  const drawerActions: DrawerActions = useMemo(
    () => ({ showDrawer, hideDrawer }),
    [showDrawer, hideDrawer]
  );

  return (
    <DrawerStateContext.Provider value={drawerState}>
      <DrawerActionsContext.Provider value={drawerActions}>
        {children}
      </DrawerActionsContext.Provider>
    </DrawerStateContext.Provider>
  );
}

export default SidebarDrawerProvider;

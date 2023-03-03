import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

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

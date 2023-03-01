import {
  createContext,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

type ActiveDrawer = {
  content: ReactElement;
  headerText?: string;
  drawerName: string;
  showDoneFooter?: boolean;
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
      // If the drawer is already open, close it
      if (previous.activeDrawer?.drawerName === props.drawerName) {
        return { activeDrawer: null };
      }

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

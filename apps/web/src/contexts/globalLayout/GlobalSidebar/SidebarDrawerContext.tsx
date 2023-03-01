import {
  createContext,
  memo,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import AnimatedSidebarDrawer from './AnimatedSidebarDrawer';

type ActiveDrawer = {
  content: ReactElement;
  headerText?: string;
  drawerName: string;
  showDoneFooter?: boolean;
};

type DrawerState = {
  activeDrawer: ActiveDrawer | null;
};

const ShowDoneFooter = ['settings'];

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
      // todo fix bug where clicking outside the drawer closes it so this button re-opens it
      if (previous.activeDrawer?.drawerName === props.drawerName) {
        return { activeDrawer: null };
      }

      return { activeDrawer: props };
    });
    // drawerState.activeDrawer?.drawerName === props.drawerName
    //   ? setDrawerState({ activeDrawer: null })
    //   : setDrawerState({ activeDrawer: props });
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
        {drawerState.activeDrawer && (
          <AnimatedSidebarDrawer
            content={drawerState.activeDrawer.content}
            headerText={drawerState.activeDrawer.headerText}
            hideDrawer={hideDrawer}
            showDoneFooter={ShowDoneFooter.includes(drawerState.activeDrawer.drawerName)}
          />
        )}
      </DrawerActionsContext.Provider>
    </DrawerStateContext.Provider>
  );
}

export default SidebarDrawerProvider;
// export default memo(SidebarDrawerProvider);

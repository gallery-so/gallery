import {
  createContext,
  memo,
  MutableRefObject,
  ReactElement,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

import AnimatedSidebarDrawer from './AnimatedSidebarDrawer';

type DrawerState = {
  isDrawerOpenRef: MutableRefObject<boolean>;
};

const SidebarDrawerContext = createContext<DrawerState | undefined>(undefined);

export const useDrawerState = (): DrawerState => {
  const context = useContext(SidebarDrawerContext);
  if (!context) {
    throw new Error('Attempted to use SidebarDrawerContext without a provider!');
  }

  return context;
};

// type Props = {};

type ShowDrawerProps = {
  content: ReactElement;
  headerText?: string;
};

type DrawerActions = {
  showDrawer: (props: ShowDrawerProps) => void;
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
  const isDrawerOpenRef = useRef(false);
  const [drawerProps, setDrawerProps] = useState<ShowDrawerProps | null>(null);

  const showDrawer = useCallback((props: ShowDrawerProps) => {
    setDrawerProps(props);
  }, []);

  const hideDrawer = (): void => {
    setDrawerProps(null);
  };

  return (
    <SidebarDrawerContext.Provider value={{ isDrawerOpenRef }}>
      <DrawerActionsContext.Provider value={{ showDrawer, hideDrawer }}>
        {children}
        {drawerProps && (
          <AnimatedSidebarDrawer
            content={drawerProps.content}
            headerText={drawerProps.headerText}
            hideDrawer={hideDrawer}
          />
        )}
      </DrawerActionsContext.Provider>
    </SidebarDrawerContext.Provider>
  );
}

export default memo(SidebarDrawerProvider);

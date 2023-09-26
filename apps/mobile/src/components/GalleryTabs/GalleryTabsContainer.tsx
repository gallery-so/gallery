import { useColorScheme } from 'nativewind';
import { ForwardedRef, forwardRef, Suspense, useRef } from 'react';
import { Tabs } from 'react-native-collapsible-tab-view';
import {
  CollapsibleRef,
  TabReactElement,
} from 'react-native-collapsible-tab-view/lib/typescript/src/types';

import colors from '~/shared/theme/colors';

type GalleryTabsContainerProps = {
  children: TabReactElement<string> | TabReactElement<string>[];
  initialTabName?: string;
  TabBar?: () => JSX.Element;
  Header?: () => JSX.Element;
};

type GalleryTabsContainerType = CollapsibleRef<string>;

const GalleryTabsContainer: React.FC<GalleryTabsContainerProps> = (
  props,
  ref: ForwardedRef<GalleryTabsContainerType>
) => {
  const { children, TabBar, Header, initialTabName } = props;
  const { colorScheme } = useColorScheme();

  const containerRef = useRef<GalleryTabsContainerType | null>(null);

  return (
    <Suspense fallback={null}>
      <Tabs.Container
        ref={(element) => {
          containerRef.current = element;
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
        }}
        initialTabName={initialTabName}
        pagerProps={{ scrollEnabled: false }}
        containerStyle={{
          backgroundColor: colorScheme === 'light' ? colors.white : colors.black['900'],
        }}
        headerContainerStyle={{
          margin: 0,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomColor: 'transparent',
          backgroundColor: colorScheme === 'light' ? colors.white : colors.black['900'],
        }}
        renderTabBar={TabBar || Empty}
        renderHeader={Header || Empty}
      >
        {children}
      </Tabs.Container>
    </Suspense>
  );
};

function Empty() {
  return null;
}

const ForwardedGalleryTabsContainer = forwardRef<
  GalleryTabsContainerType,
  GalleryTabsContainerProps
>(
  GalleryTabsContainer as React.ForwardRefRenderFunction<
    GalleryTabsContainerType,
    GalleryTabsContainerProps
  >
);

export { ForwardedGalleryTabsContainer as GalleryTabsContainer };

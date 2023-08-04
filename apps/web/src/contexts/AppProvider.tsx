import { lazy } from 'react';
import { Environment, PreloadedQuery, RelayEnvironmentProvider } from 'react-relay';

import Debugger from '~/components/Debugger/Debugger';
import SearchProvider from '~/components/Search/SearchContext';
import { GalleryNavigationProvider } from '~/contexts/navigation/GalleryNavigationProvider';
import { NftErrorProvider } from '~/contexts/NftErrorContext';
import { SyncTokensLockProvider } from '~/contexts/SyncTokensLockContext';
import { GlobalLayoutContextQuery } from '~/generated/GlobalLayoutContextQuery.graphql';
import isProduction from '~/utils/isProduction';

import AnalyticsProvider from './analytics/WebAnalyticsProvider';
import Boundary from './boundary/Boundary';
import { WebErrorReportingProvider } from './errorReporting/WebErrorReportingProvider';
// import FullPageNftDetailModalListener from './fullPageNftDetailModalListener/FullPageNftDetailModalListener';
import GlobalLayoutContextProvider from './globalLayout/GlobalLayoutContext';
import SidebarDrawerProvider from './globalLayout/GlobalSidebar/SidebarDrawerContext';
import ModalProvider from './modal/ModalContext';
import { SwrProvider } from './swr/SwrContext';
import ToastProvider from './toast/ToastContext';

const FullPageNftDetailModalListener = lazy(
  () => import('./fullPageNftDetailModalListener/FullPageNftDetailModalListener')
);

type Props = {
  children: React.ReactNode;
  relayEnvironment: Environment;
  globalLayoutContextPreloadedQuery: PreloadedQuery<GlobalLayoutContextQuery>;
};

const isProd = isProduction();

export default function AppProvider({
  children,
  relayEnvironment,
  globalLayoutContextPreloadedQuery,
}: Props) {
  return (
    <Boundary>
      <ToastProvider>
        <RelayEnvironmentProvider environment={relayEnvironment}>
          <AnalyticsProvider>
            <WebErrorReportingProvider>
              <SwrProvider>
                <GalleryNavigationProvider>
                  <NftErrorProvider>
                    <SyncTokensLockProvider>
                      <ModalProvider>
                        <SidebarDrawerProvider>
                          <SearchProvider>
                            <GlobalLayoutContextProvider
                              preloadedQuery={globalLayoutContextPreloadedQuery}
                            >
                              <FullPageNftDetailModalListener />
                              {isProd ? null : <Debugger />}
                              {children}
                            </GlobalLayoutContextProvider>
                          </SearchProvider>
                        </SidebarDrawerProvider>
                      </ModalProvider>
                    </SyncTokensLockProvider>
                  </NftErrorProvider>
                </GalleryNavigationProvider>
              </SwrProvider>
            </WebErrorReportingProvider>
          </AnalyticsProvider>
        </RelayEnvironmentProvider>
      </ToastProvider>
    </Boundary>
  );
}

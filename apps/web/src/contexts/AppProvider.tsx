import { lazy } from 'react';
import { Environment, PreloadedQuery, RelayEnvironmentProvider } from 'react-relay';

import Debugger from '~/components/Debugger/Debugger';
import SearchProvider from '~/components/Search/SearchContext';
import { GalleryNavigationProvider } from '~/contexts/navigation/GalleryNavigationProvider';
import { NftErrorProvider } from '~/contexts/NftErrorContext';
import { SyncTokensLockProvider } from '~/contexts/SyncTokensLockContext';
import { GlobalLayoutContextQuery } from '~/generated/GlobalLayoutContextQuery.graphql';
import MaintenancePage from '~/scenes/MaintenancePage/MaintenancePage';
import MaintenanceStatusProvider from '~/shared/contexts/MaintenanceStatusContext';
import isProduction from '~/utils/isProduction';

import AnalyticsProvider from './analytics/WebAnalyticsProvider';
import Boundary from './boundary/Boundary';
import { WebErrorReportingProvider } from './errorReporting/WebErrorReportingProvider';
import GlobalLayoutContextProvider from './globalLayout/GlobalLayoutContext';
import NftPreviewFallbackProvider from './nftPreviewFallback/NftPreviewFallbackContext';
import SidebarDrawerProvider from './globalLayout/GlobalSidebar/SidebarDrawerContext';
import ModalProvider from './modal/ModalContext';
import PostComposerProvider from './postComposer/PostComposerContext';
import SnowProvider from './snow/SnowContext';
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
        <MaintenanceStatusProvider
          sanityProjectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
          MaintenancePageComponent={<MaintenancePage />}
        >
          <Boundary>
            <RelayEnvironmentProvider environment={relayEnvironment}>
              <AnalyticsProvider>
                <WebErrorReportingProvider>
                  <SwrProvider>
                    <GalleryNavigationProvider>
                      <NftPreviewFallbackProvider>
                        <NftErrorProvider>
                          <SyncTokensLockProvider>
                            <PostComposerProvider>
                              <ModalProvider>
                                <SidebarDrawerProvider>
                                  <SearchProvider>
                                    <SnowProvider>
                                      <GlobalLayoutContextProvider
                                        preloadedQuery={globalLayoutContextPreloadedQuery}
                                      >
                                        <FullPageNftDetailModalListener />
                                        {isProd ? null : <Debugger />}
                                        {children}
                                      </GlobalLayoutContextProvider>
                                    </SnowProvider>
                                  </SearchProvider>
                                </SidebarDrawerProvider>
                              </ModalProvider>
                            </PostComposerProvider>
                          </SyncTokensLockProvider>
                        </NftErrorProvider>
                      </NftPreviewFallbackProvider>
                    </GalleryNavigationProvider>
                  </SwrProvider>
                </WebErrorReportingProvider>
              </AnalyticsProvider>
            </RelayEnvironmentProvider>
          </Boundary>
        </MaintenanceStatusProvider>
      </ToastProvider>
    </Boundary>
  );
}

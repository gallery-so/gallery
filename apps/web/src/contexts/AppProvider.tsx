import { Environment, PreloadedQuery, RelayEnvironmentProvider } from 'react-relay';

import Debugger from '~/components/Debugger/Debugger';
import { GalleryNavigationProvider } from '~/contexts/navigation/GalleryNavigationProvider';
import { NftErrorProvider } from '~/contexts/NftErrorContext';
import { SyncTokensLockProvider } from '~/contexts/SyncTokensLockContext';
import { AuthContextFetchUserQuery } from '~/generated/AuthContextFetchUserQuery.graphql';
import { GlobalLayoutContextQuery } from '~/generated/GlobalLayoutContextQuery.graphql';
import isProduction from '~/utils/isProduction';

import AnalyticsProvider from './analytics/AnalyticsContext';
import AuthProvider from './auth/AuthContext';
import Boundary from './boundary/Boundary';
import { WebErrorReportingProvider } from './errorReporting/WebErrorReportingProvider';
import GlobalLayoutContextProvider from './globalLayout/GlobalLayoutContext';
import SidebarDrawerProvider from './globalLayout/GlobalSidebar/SidebarDrawerContext';
import ModalProvider from './modal/ModalContext';
import { SwrProvider } from './swr/SwrContext';
import ToastProvider from './toast/ToastContext';

type Props = {
  children: React.ReactNode;
  relayEnvironment: Environment;
  authProviderPreloadedQuery: PreloadedQuery<AuthContextFetchUserQuery>;
  globalLayoutContextPreloadedQuery: PreloadedQuery<GlobalLayoutContextQuery>;
};

const isProd = isProduction();

export default function AppProvider({
  children,
  relayEnvironment,
  authProviderPreloadedQuery,
  globalLayoutContextPreloadedQuery,
}: Props) {
  return (
    <Boundary>
      <ToastProvider>
        <RelayEnvironmentProvider environment={relayEnvironment}>
          <AuthProvider preloadedQuery={authProviderPreloadedQuery}>
            <AnalyticsProvider>
              <WebErrorReportingProvider>
                <SwrProvider>
                  <GalleryNavigationProvider>
                    <NftErrorProvider>
                      <ModalProvider>
                        <SidebarDrawerProvider>
                          <SyncTokensLockProvider>
                            <GlobalLayoutContextProvider
                              preloadedQuery={globalLayoutContextPreloadedQuery}
                            >
                              {isProd ? null : <Debugger />}
                              {children}
                            </GlobalLayoutContextProvider>
                          </SyncTokensLockProvider>
                        </SidebarDrawerProvider>
                      </ModalProvider>
                    </NftErrorProvider>
                  </GalleryNavigationProvider>
                </SwrProvider>
              </WebErrorReportingProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </RelayEnvironmentProvider>
      </ToastProvider>
    </Boundary>
  );
}

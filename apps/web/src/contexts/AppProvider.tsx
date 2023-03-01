import { Environment, RelayEnvironmentProvider } from 'react-relay';

import Debugger from '~/components/Debugger/Debugger';
import { GalleryNavigationProvider } from '~/contexts/navigation/GalleryNavigationProvider';
import { NftErrorProvider } from '~/contexts/NftErrorContext';
import { SyncTokensLockProvider } from '~/contexts/SyncTokensLockContext';
import isProduction from '~/utils/isProduction';

import AnalyticsProvider from './analytics/AnalyticsContext';
import AuthProvider from './auth/AuthContext';
import Boundary from './boundary/Boundary';
import ErrorReportingProvider from './errorReporting/ErrorReportingContext';
import GlobalLayoutContextProvider from './globalLayout/GlobalLayoutContext';
import SidebarDrawerProvider from './globalLayout/GlobalSidebar/SidebarDrawerContext';
import ModalProvider from './modal/ModalContext';
import { SwrProvider } from './swr/SwrContext';
import ToastProvider from './toast/ToastContext';

type Props = {
  children: React.ReactNode;
  relayEnvironment: Environment;
};

const isProd = isProduction();

export default function AppProvider({ children, relayEnvironment }: Props) {
  return (
    <Boundary>
      <ToastProvider>
        <RelayEnvironmentProvider environment={relayEnvironment}>
          <AuthProvider>
            <AnalyticsProvider>
              <ErrorReportingProvider>
                <SwrProvider>
                  <GalleryNavigationProvider>
                    <NftErrorProvider>
                      <ModalProvider>
                        <SidebarDrawerProvider>
                          <SyncTokensLockProvider>
                            <GlobalLayoutContextProvider>
                              {isProd ? null : <Debugger />}
                              {children}
                            </GlobalLayoutContextProvider>
                          </SyncTokensLockProvider>
                        </SidebarDrawerProvider>
                      </ModalProvider>
                    </NftErrorProvider>
                  </GalleryNavigationProvider>
                </SwrProvider>
              </ErrorReportingProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </RelayEnvironmentProvider>
      </ToastProvider>
    </Boundary>
  );
}

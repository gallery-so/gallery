import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

import Debugger from '~/components/Debugger/Debugger';
import { GalleryNavigationProvider } from '~/contexts/navigation/GalleryNavigationProvider';
import { RelayProvider } from '~/contexts/relay/RelayProvider';
import { SyncTokensLockProvider } from '~/contexts/SyncTokensLockContext';
import isProduction from '~/utils/isProduction';

import AnalyticsProvider from './analytics/AnalyticsContext';
import AuthProvider from './auth/AuthContext';
import { Web3ProviderNetwork } from './auth/Web3WalletContext';
import BeaconProvider from './beacon/BeaconContext';
import Boundary from './boundary/Boundary';
import ErrorReportingProvider from './errorReporting/ErrorReportingContext';
import GlobalLayoutContextProvider from './globalLayout/GlobalLayoutContext';
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
                <Web3ProviderNetwork>
                  <SwrProvider>
                    <BeaconProvider>
                      <GalleryNavigationProvider>
                        <ModalProvider>
                          <SyncTokensLockProvider>
                            <GlobalLayoutContextProvider>
                              {isProd ? null : <Debugger />}
                              {children}
                            </GlobalLayoutContextProvider>
                          </SyncTokensLockProvider>
                        </ModalProvider>
                      </GalleryNavigationProvider>
                    </BeaconProvider>
                  </SwrProvider>
                </Web3ProviderNetwork>
              </ErrorReportingProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </RelayEnvironmentProvider>
      </ToastProvider>
    </Boundary>
  );
}

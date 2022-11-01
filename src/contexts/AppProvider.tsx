import { SwrProvider } from './swr/SwrContext';
import Boundary from './boundary/Boundary';
import AuthProvider from './auth/AuthContext';
import ModalProvider from './modal/ModalContext';
import ToastProvider from './toast/ToastContext';
import AnalyticsProvider from './analytics/AnalyticsContext';
import ErrorReportingProvider from './errorReporting/ErrorReportingContext';
import { Web3ProviderNetwork } from './auth/Web3WalletContext';
import { GalleryNavigationProvider } from 'contexts/navigation/GalleryNavigationProvider';
import { RelayProvider } from 'contexts/relay/RelayProvider';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';
import GlobalLayoutContextProvider from './globalLayout/GlobalLayoutContext';
import Debugger from 'components/Debugger/Debugger';
import isProduction from 'utils/isProduction';
import BeaconProvider from './beacon/BeaconContext';
import { SyncTokensLockProvider } from 'contexts/SyncTokensLockContext';

type Props = {
  children: React.ReactNode;
  relayCache?: RecordMap;
};

const isProd = isProduction();

export default function AppProvider({ children, relayCache }: Props) {
  return (
    <Boundary>
      <ToastProvider>
        <RelayProvider initialCache={relayCache}>
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
        </RelayProvider>
      </ToastProvider>
    </Boundary>
  );
}

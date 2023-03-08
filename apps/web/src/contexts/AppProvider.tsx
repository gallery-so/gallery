import { useEffect } from 'react';
import {
  Environment,
  PreloadedQuery,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from 'react-relay';
import { graphql } from 'relay-runtime';

import Debugger from '~/components/Debugger/Debugger';
import { GalleryNavigationProvider } from '~/contexts/navigation/GalleryNavigationProvider';
import { NftErrorProvider } from '~/contexts/NftErrorContext';
import { SyncTokensLockProvider } from '~/contexts/SyncTokensLockContext';
import { AppProviderMixPanelSyncQuery } from '~/generated/AppProviderMixPanelSyncQuery.graphql';
import { GlobalLayoutContextQuery } from '~/generated/GlobalLayoutContextQuery.graphql';
import isProduction from '~/utils/isProduction';

import AnalyticsProvider, { _identify } from './analytics/AnalyticsContext';
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
  globalLayoutContextPreloadedQuery: PreloadedQuery<GlobalLayoutContextQuery>;
};

function MixPanelUserIdSync() {
  const query = useLazyLoadQuery<AppProviderMixPanelSyncQuery>(
    graphql`
      query AppProviderMixPanelSyncQuery {
        viewer {
          ... on Viewer {
            user {
              dbid
            }
          }
        }
      }
    `,
    {},
    { fetchPolicy: 'store-only' }
  );

  useEffect(() => {
    const userId = query.viewer?.user?.dbid;

    if (userId) {
      _identify(userId);
    }
  }, [query.viewer?.user?.dbid]);

  return null;
}

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
                    <ModalProvider>
                      <SidebarDrawerProvider>
                        <SyncTokensLockProvider>
                          <GlobalLayoutContextProvider
                            preloadedQuery={globalLayoutContextPreloadedQuery}
                          >
                            {isProd ? null : <Debugger />}
                            <MixPanelUserIdSync />
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
        </RelayEnvironmentProvider>
      </ToastProvider>
    </Boundary>
  );
}

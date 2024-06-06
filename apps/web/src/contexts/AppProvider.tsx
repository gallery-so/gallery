import { PrivyClientConfig, PrivyProvider } from '@privy-io/react-auth';
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
import BottomSheetProvider from './bottomsheet/BottomSheetContext';
import Boundary from './boundary/Boundary';
import { WebErrorReportingProvider } from './errorReporting/WebErrorReportingProvider';
import GlobalLayoutContextProvider from './globalLayout/GlobalLayoutContext';
import SidebarDrawerProvider from './globalLayout/GlobalSidebar/SidebarDrawerContext';
import ModalProvider from './modal/ModalContext';
import NftPreviewFallbackProvider from './nftPreviewFallback/NftPreviewFallbackContext';
import { OnboardingProgressProvider } from './onboardingProgress';
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

const privyConfig: PrivyClientConfig = {
  loginMethods: ['email'],
  embeddedWallets: {
    // automatically generate embedded wallets for new users signing up with privy emails.
    // this will not apply to users signing up with farcaster or wallet extensions, since
    // those methods already come with a wallet.
    createOnLogin: 'users-without-wallets',
  },
};

export default function AppProvider({
  children,
  relayEnvironment,
  globalLayoutContextPreloadedQuery,
}: Props) {
  return (
    <OnboardingProgressProvider>
      <Boundary>
        <ToastProvider>
          <MaintenanceStatusProvider
            sanityProjectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
            MaintenancePageComponent={<MaintenancePage />}
          >
            <Boundary>
              <RelayEnvironmentProvider environment={relayEnvironment}>
                <PrivyProvider
                  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? ''}
                  config={privyConfig}
                >
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
                                        <SnowProvider enabled={false}>
                                          <GlobalLayoutContextProvider
                                            preloadedQuery={globalLayoutContextPreloadedQuery}
                                          >
                                            <BottomSheetProvider>
                                              <FullPageNftDetailModalListener />
                                              {isProd ? null : <Debugger />}
                                              {children}
                                            </BottomSheetProvider>
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
                </PrivyProvider>
              </RelayEnvironmentProvider>
            </Boundary>
          </MaintenanceStatusProvider>
        </ToastProvider>
      </Boundary>
    </OnboardingProgressProvider>
  );
}

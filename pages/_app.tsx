import { FC, ComponentType, useEffect } from 'react';

import 'src/components/FadeTransitioner/transition.css';
import 'src/scenes/WelcomeAnimation/intro.css';
import 'src/index.css';
import 'src/scenes/NftDetailPage/model-viewer.css';

import Head from 'next/head';
import AppProvider from 'contexts/AppProvider';
import FadeTransitioner from 'components/FadeTransitioner/FadeTransitioner';
import { useRouter } from 'next/router';
import Mixpanel from 'utils/mixpanel';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

const SafeHydrate: FC = ({ children }) => (
  <div suppressHydrationWarning>{typeof window === 'undefined' ? null : children}</div>
);

const App: FC<{
  Component: ComponentType;
  pageProps: Record<string, unknown>;
}> = ({ Component, pageProps }) => {
  const { asPath } = useRouter();

  const relayCache = pageProps.__relayCache as RecordMap | undefined;

  useEffect(() => {
    Mixpanel.track('Page view', { path: asPath });
  }, [asPath]);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Show your collection to the world." />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        <meta property="og:type" content="website" />
        <meta property="og:title" content="Gallery" key="og:title" />
        <meta property="og:description" content="Show your collection to the world." />
        <meta
          property="og:image"
          content="https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@usegallery" />
        <meta name="twitter:title" content="Gallery" key="twitter:title" />
        <meta name="twitter:description" content="Show your collection to the world." />
        <meta
          name="twitter:image"
          content="https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo.png"
        />

        <title>Gallery</title>
      </Head>
      <SafeHydrate>
        <AppProvider relayCache={relayCache}>
          <FadeTransitioner locationKey={asPath}>
            <Component {...pageProps} />
          </FadeTransitioner>
        </AppProvider>
      </SafeHydrate>
    </>
  );
};

export default App;

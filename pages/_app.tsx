import { FC, ComponentType } from 'react';

import 'src/components/FadeTransitioner/transition.css';
import 'src/scenes/WelcomeAnimation/intro.css';
import 'src/index.css';
import 'src/scenes/NftDetailPage/model-viewer.css';

import Head from 'next/head';
import AppProvider from 'contexts/AppProvider';
import FadeTransitioner from 'components/FadeTransitioner/FadeTransitioner';
import { useRouter } from 'next/router';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

type NameOrProperty =
  | { name: string; property?: undefined }
  | { name?: undefined; property: string };
type MetaTag = NameOrProperty & {
  content: string;
};

export type MetaTagProps = {
  metaTags?: MetaTag[] | null;
};

const SafeHydrate: FC = ({ children }) => (
  <div suppressHydrationWarning>{typeof window === 'undefined' ? null : children}</div>
);

const App: FC<{
  Component: ComponentType<MetaTagProps>;
  pageProps: MetaTagProps & Record<string, unknown>;
}> = ({ Component, pageProps }) => {
  const relayCache = pageProps.__relayCache as RecordMap | undefined;

  const { asPath } = useRouter();

  return (
    <>
      <Head>
        <title>Gallery</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        {pageProps.metaTags?.length ? (
          pageProps.metaTags.map((metaTag) => (
            <meta key={metaTag.name ?? metaTag.property} {...metaTag} />
          ))
        ) : (
          <>
            <meta name="description" content="Show your collection to the world." />

            <meta property="og:type" content="website" />
            <meta property="og:title" content="Gallery" />
            <meta property="og:description" content="Show your collection to the world." />

            <meta
              property="og:image"
              content="https://storage.googleapis.com/gallery-prod-325303.appspot.com/gallery_full_logo_v2.1.png"
            />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@gallery" />
          </>
        )}
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

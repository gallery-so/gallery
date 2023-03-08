import 'src/scenes/WelcomeAnimation/intro.css';
import 'src/index.css';
import 'src/scenes/NftDetailPage/model-viewer.css';
import 'react-loading-skeleton/dist/skeleton.css';

import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ComponentType, FC, PropsWithChildren, useEffect, useState } from 'react';
import { PreloadedQuery } from 'react-relay';

import GoogleAnalytics from '~/components/GoogleAnalytics';
import AppProvider from '~/contexts/AppProvider';
import AuthProvider from '~/contexts/auth/AuthContext';
import GlobalLayoutContext from '~/contexts/globalLayout/GlobalLayoutContext';
import { createRelayEnvironmentFromRecords } from '~/contexts/relay/RelayProvider';
import { PreloadQueryFn } from '~/types/PageComponentPreloadQuery';
import isProduction from '~/utils/isProduction';
import welcomeDoormat from '~/utils/welcomeDoormat';

type NameOrProperty =
  | { name: string; property?: undefined }
  | { name?: undefined; property: string };
type MetaTag = NameOrProperty & {
  content: string;
};

export type MetaTagProps = {
  metaTags?: MetaTag[] | null;
};

type PageComponent = ComponentType<
  MetaTagProps & { preloadedQuery?: PreloadedQuery<never> | null }
> & {
  preloadQuery?: PreloadQueryFn<never>;
};

// This component ensures that we don't try to render anything on the server.
// We have a long way to go until we're able to do this w/o compromising
// on the user's experience.
function SafeHydrate({ children }: PropsWithChildren) {
  const [render, setRender] = useState(false);

  useEffect(() => {
    setRender(true);
  }, []);

  return <div suppressHydrationWarning>{render ? children : null}</div>;
}

type PageProps = MetaTagProps & { preloadedQuery: null | PreloadedQuery<never> };
type AppProps = {
  Component: PageComponent;
  pageProps: PageProps;
};

function Page({ Component, pageProps }: AppProps) {
  const [relayEnvironment] = useState(() => createRelayEnvironmentFromRecords({}));

  const { query } = useRouter();

  const componentPreloadedQuery = Component?.preloadQuery?.({ relayEnvironment, query });
  const authProviderPreloadedQuery = AuthProvider.preloadQuery?.({ relayEnvironment, query });
  const globalLayoutContextPreloadedQuery = GlobalLayoutContext.preloadQuery?.({
    relayEnvironment,
    query,
  });

  if (!authProviderPreloadedQuery || !globalLayoutContextPreloadedQuery) {
    throw new Error('Preloaded Queries were not returned from preloadQuery function');
  }

  return (
    <AppProvider
      authProviderPreloadedQuery={authProviderPreloadedQuery}
      globalLayoutContextPreloadedQuery={globalLayoutContextPreloadedQuery}
      relayEnvironment={relayEnvironment}
    >
      <>
        <GoogleAnalytics />
        <Analytics
          beforeSend={(event) => {
            // Ignore sending noisy events related to /opengraph previews
            if (event.url.includes('/opengraph')) {
              return null;
            }
            return event;
          }}
        />
        <Component {...pageProps} preloadedQuery={componentPreloadedQuery} />
      </>
    </AppProvider>
  );
}

const App: FC<AppProps> = (props) => {
  useEffect(() => {
    if (isProduction()) welcomeDoormat();
  }, []);

  return (
    <>
      <Head>
        <title>Gallery</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#ffffff" />

        {props.pageProps.metaTags?.length ? (
          props.pageProps.metaTags.map((metaTag) => (
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
        <Page {...props} />
      </SafeHydrate>
    </>
  );
};

export default App;

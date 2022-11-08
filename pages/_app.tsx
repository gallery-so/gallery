import 'src/components/FadeTransitioner/transition.css';
import 'src/scenes/WelcomeAnimation/intro.css';
import 'src/index.css';
import 'src/scenes/NftDetailPage/model-viewer.css';

import { Analytics } from '@vercel/analytics/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ComponentType, FC, PropsWithChildren, useEffect, useState } from 'react';
import { RecordMap } from 'relay-runtime/lib/store/RelayStoreTypes';

import FadeTransitioner, {
  useStabilizedRouteTransitionKey,
} from '~/components/FadeTransitioner/FadeTransitioner';
import AppProvider from '~/contexts/AppProvider';
import { createRelayEnvironmentFromRecords } from '~/contexts/relay/RelayProvider';
import { PreloadQueryArgs } from '~/types/PageComponentPreloadQuery';
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

type PageComponent = ComponentType<MetaTagProps> & {
  preloadQuery?: (args: PreloadQueryArgs) => Promise<void>;
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

const App: FC<{
  Component: PageComponent;
  pageProps: MetaTagProps & Record<string, unknown>;
}> = ({ Component, pageProps }) => {
  const relayCache = pageProps.__relayCache as RecordMap | undefined;
  const [relayEnvironment] = useState(() => createRelayEnvironmentFromRecords(relayCache));

  const locationKey = useStabilizedRouteTransitionKey();

  useEffect(() => {
    if (isProduction()) welcomeDoormat();
  }, []);

  const { query } = useRouter();
  if (Component.preloadQuery) {
    Component.preloadQuery({ relayEnvironment, query });
  }

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
        <AppProvider relayEnvironment={relayEnvironment}>
          <FadeTransitioner locationKey={locationKey}>
            <>
              <Component {...pageProps} />
              <Analytics />
            </>
          </FadeTransitioner>
        </AppProvider>
      </SafeHydrate>
    </>
  );
};

export default App;

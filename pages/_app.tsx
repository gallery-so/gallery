import 'src/components/FadeTransitioner/transition.css';
import 'src/scenes/WelcomeAnimation/intro.css';
import Head from 'next/head';

function SafeHydrate({ children }) {
  return (
    <div suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </div>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Show your collection to the world." />

        <title>Gallery</title>
      </Head>
      <SafeHydrate>
        <Component {...pageProps} />
      </SafeHydrate>
    </>
  );
}

export default MyApp;

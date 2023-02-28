import fetch from 'node-fetch';
global.fetch = fetch;

// https://github.com/nandorojo/solito/issues/333#issuecomment-1440786109
// We mock Next.js's useRouter hook using the "next-router-mock" package:
jest.mock('next/dist/client/router', () => jest.requireActual('next-router-mock'));
jest.mock('next/dist/shared/lib/router-context', () => {
  const { createContext } = jest.requireActual('react');
  const router = jest.requireActual('next-router-mock').default;
  const RouterContext = createContext(router);
  return { RouterContext };
});

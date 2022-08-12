// TODO: re-enable this after rainbowkit issue is reolved: https://github.com/rainbow-me/rainbowkit/issues/461
// unfortunately, mocking the breaking rainbowkit import does not fix the issue
test('NavActionFollow', () => {});

export {};
// import { screen, render } from '@testing-library/react';
// import NavActionFollow from './NavActionFollow';
// import { useLazyLoadQuery } from 'react-relay/hooks';
// import { graphql } from 'react-relay';
// import { RelayProvider } from 'contexts/relay/RelayProvider';
// import { Suspense } from 'react';
// import nock from 'nock';
// import { baseurl } from 'contexts/swr/fetch';
// import { NavActionFollowTestQueryQuery } from 'src/__generated__/operations';
// import ModalProvider from 'contexts/modal/ModalContext';
// import ToastProvider from 'contexts/toast/ToastContext';
// import { NavActionFollowTestQuery } from '__generated__/NavActionFollowTestQuery.graphql';
// import Boundary from 'contexts/boundary/Boundary';

// jest.mock('@rainbow-me/rainbowkit', () => ({
//   useConnectModal: jest.fn(),
// }));

// jest.mock('next/router', () => ({
//   useRouter() {
//     return {
//       route: '/',
//       pathname: '',
//       query: '',
//       asPath: '',
//     };
//   },
// }));

// const Fixture = () => {
//   const query = useLazyLoadQuery<NavActionFollowTestQuery>(
//     graphql`
//       query NavActionFollowTestQuery {
//         viewer {
//           ... on Viewer {
//             user {
//               ...NavActionFollowUserFragment
//             }
//           }
//         }
//         ...NavActionFollowQueryFragment
//       }
//     `,
//     {}
//   );

//   if (!query.viewer?.user) {
//     throw new Error('Yikes, should have had a user');
//   }

//   return <NavActionFollow userRef={query.viewer.user} queryRef={query} />;
// };

// test('it renders the Follow button', async () => {
//   const response: NavActionFollowTestQueryQuery = {
//     __typename: 'Query',
//     viewer: {
//       __typename: 'Viewer',
//       user: {
//         __typename: 'GalleryUser',
//         username: 'some_user_username',
//         dbid: 'some_user_dbid',
//         id: 'some_user_id',
//         following: [
//           {
//             __typename: 'GalleryUser',
//             username: 'some username',
//             dbid: 'some_follower_user_dbid',
//             bio: 'soem value',

//             id: 'some_follower_user_id',
//           },
//         ],
//         followers: [
//           {
//             __typename: 'GalleryUser',
//             id: 'some_follower_user_id',
//             username: 'some username',
//             dbid: 'some_follower_user_dbid',
//             bio: 'soem value',
//           },
//         ],
//       },
//       // @ts-expect-error
//       id: 'some_viewer_id',
//     },
//   };

//   nock(baseurl).post('/glry/graphql/query').reply(200, { data: response });

//   await render(
//     <Boundary>
//       <ToastProvider>
//         <RelayProvider>
//           <ModalProvider>
//             <Suspense fallback={null}>
//               <Fixture />
//             </Suspense>
//           </ModalProvider>
//         </RelayProvider>
//       </ToastProvider>
//     </Boundary>
//   );

//   await new Promise((resolve) => setTimeout(resolve, 500));

//   expect(screen.getByTestId('follow-button')).toBeDefined();
//   expect(screen.getByTestId('follow-button-tooltip')).toBeDefined();
// });

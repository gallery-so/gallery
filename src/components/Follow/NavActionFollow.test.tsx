import { render } from '@testing-library/react';
import NavActionFollow from './NavActionFollow';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { graphql } from 'react-relay';
import { RelayProvider } from 'contexts/relay/RelayProvider';
import { Suspense } from 'react';
import { NavActionFollowTestQuery } from '__generated__/NavActionFollowTestQuery.graphql';
import nock from 'nock';
import { baseurl } from 'contexts/swr/fetch';
import { NavActionFollowTestQueryQuery } from 'src/__generated__/operations';
import ModalProvider from 'contexts/modal/ModalContext';
import ToastProvider from 'contexts/toast/ToastContext';

const Fixture = () => {
  const query = useLazyLoadQuery<NavActionFollowTestQuery>(
    graphql`
      query NavActionFollowTestQuery {
        viewer {
          ... on Viewer {
            user {
              ...NavActionFollowUserFragment
            }
          }
        }

        ...NavActionFollowQueryFragment
      }
    `,
    {}
  );

  if (!query.viewer?.user) {
    throw new Error('Yikes, should have had a user');
  }

  return <NavActionFollow userRef={query.viewer.user} queryRef={query} />;
};

test.only('it works', async () => {
  const response: NavActionFollowTestQueryQuery = {
    __typename: 'Query',
    viewer: {
      __typename: 'Viewer',
      user: {
        __typename: 'GalleryUser',
        dbid: 'some_user_dbid',
        id: 'some_user_id',
        following: [
          {
            __typename: 'GalleryUser',
            username: 'some username',
            dbid: 'some_follower_user_dbid',
            bio: 'soem value',

            // @ts-expect-error
            id: 'some_follower_user_id',
          },
        ],
        followers: [
          {
            __typename: 'GalleryUser',
            id: 'some_follower_user_id',
            username: 'some username',
            dbid: 'some_follower_user_dbid',
            bio: 'soem value',
          },
        ],
      },

      id: 'some_viewer_id',
    },
  };

  nock(baseurl).post('/glry/graphql/query').reply(200, { data: response });

  const { debug } = render(
    <ToastProvider>
      <RelayProvider>
        <ModalProvider>
          <Suspense fallback={null}>
            <Fixture />
          </Suspense>
        </ModalProvider>
      </RelayProvider>
    </ToastProvider>
  );

  await new Promise((resolve) => setTimeout(resolve, 500));

  debug();
});

// describe('NavActionFollow', () => {

// not signed in, it says "sign in " and button is disabled
// signed in and viewing my own profile - button is disabled
// signed in and viewing someone else's profile - button is enabled
// - following
// - not following
// });

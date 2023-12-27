import { render } from '@testing-library/react';
import { useLazyLoadQuery } from 'react-relay';
import { graphql } from 'relay-runtime';

import { SomeoneViewedYourGallery } from '~/components/Notifications/notifications/SomeoneViewedYourGallery';
import { SomeoneViewedYourGalleryTestQuery } from '~/generated/SomeoneViewedYourGalleryTestQuery.graphql';
import { noop } from '~/shared/utils/noop';
import { SomeoneViewedYourGalleryTestQueryQuery } from '~/tests/__generated__/graphql-codegen/operations';
import { MockAppProvider } from '~/tests/graphql/MockAppProvider';
import { mockGraphqlQuery } from '~/tests/graphql/mockGraphqlQuery';
import { mockProviderQueries } from '~/tests/graphql/mockProviderQueries';

function Fixture() {
  const query = useLazyLoadQuery<SomeoneViewedYourGalleryTestQuery>(
    graphql`
      query SomeoneViewedYourGalleryTestQuery {
        node(id: "test") {
          ... on SomeoneViewedYourGalleryNotification {
            __typename
            ...SomeoneViewedYourGalleryFragment
          }
        }
      }
    `,
    {}
  );

  if (query.node?.__typename === 'SomeoneViewedYourGalleryNotification') {
    return <SomeoneViewedYourGallery notificationRef={query.node} onClose={noop} />;
  }

  throw new Error('Yikes');
}

type MockResponseArgs = {
  userViews: number;
  nonUserViews: number;
};

function mockResponse({ userViews, nonUserViews }: MockResponseArgs) {
  const result: SomeoneViewedYourGalleryTestQueryQuery = {
    node: {
      __typename: 'SomeoneViewedYourGalleryNotification',
      id: 'SomeoneViewedYourGalleryNotification:notification-1',
      nonUserViewerCount: nonUserViews,
      userViewers: {
        __typename: 'GroupNotificationUsersConnection',
        pageInfo: {
          total: userViews,
        },
        edges: Array.from({ length: userViews }).map((_, index) => {
          return {
            __typename: 'GroupNotificationUserEdge',
            node: {
              __typename: 'GalleryUser',
              id: `GalleryUser:user-${index}`,
              dbid: `user-${index}`,
              username: `User ${index}`,
              profileImage: {
                __typename: 'TokenProfileImage',
                token: {
                  dbid: `testTokenId-${index}`,
                  id: `Token:testTokenId-${index}`,
                  definition: {
                    id: `Token:testTokenId-${index}`,
                    media: {
                      __typename: 'ImageMedia',
                      previewURLs: {
                        small: 'http://someurl.com',
                        medium: 'http://someurl.com',
                        large: 'http://someurl.com',
                      },
                      fallbackMedia: {
                        mediaURL: 'http://someurl.com',
                      },
                    },
                  },
                },
              },
              // Irrelevant properties
              bio: null,
              galleries: [
                {
                  __typename: 'Gallery',
                  id: `Gallery:user-${index}-gallery`,
                  collections: null,
                },
              ] as const,
              badges: null,
              followers: null,
              following: null,
            },
          } as const;
        }),
      },
    },
  };

  return result;
}

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

async function assertSituation(args: MockResponseArgs, expectedText: string) {
  const response = mockResponse(args);

  mockProviderQueries();

  window.ResizeObserver = ResizeObserver;

  mockGraphqlQuery('SomeoneViewedYourGalleryTestQuery', response);

  const { findByTestId } = render(
    <MockAppProvider>
      <Fixture />
    </MockAppProvider>
  );

  const element = await findByTestId('SomeoneViewedYourGallery');
  expect(element.textContent).toEqual(expectedText);
}

describe.skip('SomeoneViewedYourGallery', () => {
  describe('all non-user views', () => {
    test('only 1 view', async () => {
      await assertSituation(
        { userViews: 0, nonUserViews: 1 },
        'An anonymous user viewed your gallery'
      );
    });

    test('two views', async () => {
      await assertSituation(
        { userViews: 0, nonUserViews: 2 },
        '2 anonymous users viewed your gallery'
      );
    });
  });

  describe('all user views', () => {
    test('only 1 view', async () => {
      await assertSituation({ userViews: 1, nonUserViews: 0 }, 'User 0 viewed your gallery');
    });

    test('two views', async () => {
      await assertSituation(
        { userViews: 2, nonUserViews: 0 },
        'User 0 and 1 other viewed your gallery'
      );
    });

    test('three views', async () => {
      await assertSituation(
        { userViews: 3, nonUserViews: 0 },
        'User 0 and 2 others viewed your gallery'
      );
    });
  });

  describe('user and non-user views', () => {
    test('1 user and 1 non-user', async () => {
      await assertSituation(
        { nonUserViews: 1, userViews: 1 },
        'User 0 and 1 other viewed your gallery'
      );
    });

    test('1 user and 2 non-users', async () => {
      await assertSituation(
        { nonUserViews: 2, userViews: 1 },
        'User 0 and 2 others viewed your gallery'
      );
    });

    test('2 users and 1 non-user', async () => {
      await assertSituation(
        { nonUserViews: 1, userViews: 2 },
        'User 0 and 2 others viewed your gallery'
      );
    });

    test('2 users and 2 non-users', async () => {
      await assertSituation(
        { nonUserViews: 2, userViews: 2 },
        'User 0 and 3 others viewed your gallery'
      );
    });
  });
});

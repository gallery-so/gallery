import { render } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { RelayEnvironmentProvider, useLazyLoadQuery } from 'react-relay';
import { fetchQuery, graphql, Network, RecordSource, Store } from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';

import { missingFieldHandlersTestFirstQuery } from '~/generated/missingFieldHandlersTestFirstQuery.graphql';
import { missingFieldHandlersTestSecondQuery } from '~/generated/missingFieldHandlersTestSecondQuery.graphql';
import { createMissingFieldHandlers } from '~/relay/missingFieldHandlers';
import { createRelayFetchFunction } from '~/relay/network';

describe('missingFieldHandlers', () => {
  it('should work', async () => {
    const firstQuery = graphql`
      query missingFieldHandlersTestFirstQuery {
        viewer {
          ... on Viewer {
            user {
              featuredGallery {
                name
              }
            }
          }
        }
      }
    `;

    const secondQuery = graphql`
      query missingFieldHandlersTestSecondQuery {
        galleryById(id: "1") {
          ... on Gallery {
            name
          }
        }
      }
    `;

    const environment = new RelayModernEnvironment({
      missingFieldHandlers: createMissingFieldHandlers(),
      network: Network.create(
        createRelayFetchFunction({
          url: () => 'http://localhost:3000/graphql',
          persistedQueriesFetcher: () => Promise.resolve({}),
        })
      ),
      store: new Store(new RecordSource({})),
    });

    nock('http://localhost:3000')
      .post('/graphql')
      .reply(200, {
        data: {
          viewer: {
            __typename: 'Viewer',
            user: {
              id: 'GalleryUser:1',
              featuredGallery: {
                id: 'Gallery:1',
                dbid: '1',
                name: 'Test',
              },
            },
          },
        },
      });

    // Seed the cache with something that matches the Gallery but from a different resolver
    const firstResult = await fetchQuery<missingFieldHandlersTestFirstQuery>(
      environment,
      firstQuery,
      {}
    ).toPromise();

    expect(firstResult?.viewer?.user?.featuredGallery?.name).toBe('Test');

    // Component that uses the Gallery but from a different resolver
    function MissingDataComponent() {
      const data = useLazyLoadQuery<missingFieldHandlersTestSecondQuery>(
        secondQuery,
        {},
        { fetchPolicy: 'store-only' }
      );

      return <div>{data?.galleryById?.name}</div>;
    }

    const { getByText } = render(
      <RelayEnvironmentProvider environment={environment}>
        <MissingDataComponent />
      </RelayEnvironmentProvider>
    );

    expect(getByText('Test')).not.toBeNull();
  });
});

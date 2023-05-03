import nock from 'nock';
import { fetchQuery, graphql, Network, RecordSource, Store } from 'relay-runtime';
import RelayModernEnvironment from 'relay-runtime/lib/store/RelayModernEnvironment';

import { missingFieldHandlersTestFirstQuery } from '~/generated/missingFieldHandlersTestFirstQuery.graphql';
import { createRelayFetchFunction } from '~/relay/network';

describe('missingFieldHadlers', () => {
  it('should work', async () => {
    const firstQuery = graphql`
      query missingFieldHandlersTestFirstQuery {
        viewer {
          ... on Viewer {
            user {
              featuredGallery {
                dbid
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

    const firstResult = await fetchQuery<missingFieldHandlersTestFirstQuery>(
      environment,
      firstQuery,
      {}
    ).toPromise();

    expect(firstResult?.viewer?.user?.featuredGallery?.name).toBe('Test');

    const secondResult = await fetchQuery<missingFieldHandlersTestFirstQuery>(
      environment,
      secondQuery,
      {}
    ).toPromise();

    console.log(secondResult);
  });
});

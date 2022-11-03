import nock from 'nock';

import { getGraphqlHost, getGraphqlPath } from '~/contexts/relay/relayFetchFunction';

export function mockGraphqlQuery(operationName: string, response: unknown) {
  return nock(getGraphqlHost())
    .post(getGraphqlPath(), (body) => body.operationName === operationName)
    .reply(200, {
      data: response,
    });
}

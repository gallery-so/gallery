import nock from 'nock';
import { getGraphqlHost, getGraphqlPath } from '../../src/contexts/relay/relayFetchFunction';

export function mockGraphqlQuery(operationName: string, response: any) {
  return nock(getGraphqlHost())
    .post(getGraphqlPath(), (body) => body.operationName === operationName)
    .reply(200, {
      data: response,
    });
}

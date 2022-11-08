import { ParsedUrlQuery } from 'querystring';
import { Environment } from 'react-relay';

export type PreloadQueryArgs = {
  query: ParsedUrlQuery;
  relayEnvironment: Environment;
};

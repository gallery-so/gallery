import { Environment } from 'react-relay';
import { ParsedUrlQuery } from 'querystring';

export type PreloadQueryArgs = {
  query: ParsedUrlQuery;
  relayEnvironment: Environment;
};

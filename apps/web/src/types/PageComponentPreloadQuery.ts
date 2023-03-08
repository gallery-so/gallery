import { ParsedUrlQuery } from 'querystring';
import { Environment, PreloadedQuery } from 'react-relay';
import { OperationType } from 'relay-runtime';

export type PreloadQueryArgs = {
  query: ParsedUrlQuery;
  relayEnvironment: Environment;
};

export type PreloadQueryFn<T extends OperationType> = (args: PreloadQueryArgs) => PreloadedQuery<T>;

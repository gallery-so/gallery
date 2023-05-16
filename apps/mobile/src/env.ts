import AsyncStorage from '@react-native-async-storage/async-storage';

type Environment = {
  GRAPHQL_API_URL: string;
  GRAPHQL_SUBSCRIPTION_URL: string;
};

const PRODUCTION: Environment = {
  GRAPHQL_API_URL: 'https://gateway.gallery.so',
  GRAPHQL_SUBSCRIPTION_URL: 'wss://api.gallery.so/glry/graphql/query',
};

const DEVELOPMENT: Environment = {
  GRAPHQL_API_URL: 'https://gateway.dev.gallery.so/',
  GRAPHQL_SUBSCRIPTION_URL: 'wss://api.dev.gallery.so/glry/graphql/query',
};

const LOCAL: Environment = {
  GRAPHQL_API_URL: 'http://localhost:9000',
  GRAPHQL_SUBSCRIPTION_URL: 'ws://localhost:4000/glry/graphql/query',
};

export const ENVIRONMENTS = {
  LOCAL,
  DEVELOPMENT,
  PRODUCTION,
} as const;

export let environment = ENVIRONMENTS.PRODUCTION;

export function updateEnvironment(name: keyof typeof ENVIRONMENTS) {
  environment = ENVIRONMENTS[name];
  AsyncStorage.setItem('envName', name);
}

export async function loadRememberedEnvironment() {
  const env = (await AsyncStorage.getItem(
    'envName',
    () => 'PRODUCTION'
  )) as keyof typeof ENVIRONMENTS;

  environment = ENVIRONMENTS[env];
}

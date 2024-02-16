import Constants from 'expo-constants';
import { z } from 'zod';

import { EnvironmentSchema, SecretsSchema } from './env';

export type Environment = Required<z.infer<typeof EnvironmentSchema>> &
  Required<z.infer<typeof SecretsSchema>>;

export const env = Constants.expoConfig?.extra as Environment;

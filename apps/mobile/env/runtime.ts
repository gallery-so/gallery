import Constants from 'expo-constants';
import { z } from 'zod';

import { EnvironmentSchema } from './env';

export type Environment = Required<z.infer<typeof EnvironmentSchema>>;

export const env = Constants.expoConfig?.extra as Environment;

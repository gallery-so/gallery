import { Magic } from '@magic-sdk/react-native-expo';

import { env } from '~/env/runtime';

export const magic = new Magic(env.EXPO_PUBLIC_MAGIC_LINK_PUBLIC_KEY); // ✨

import { Magic } from 'magic-sdk';
import { useCallback } from 'react';

export default function useMagicLogin() {
  const m = new Magic('');

  return useCallback(
    async (email: string) => {
      return await m.auth.loginWithMagicLink({ email });
    },
    [m.auth]
  );
}

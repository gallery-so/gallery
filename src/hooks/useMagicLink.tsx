import { Magic } from 'magic-sdk';
import { useCallback } from 'react';

export default function useMagicLogin() {
  const m = new Magic(process.env.NEXT_MAGIC_LINK_PUBLISHABLE_KEY ?? '');

  return useCallback(
    async (email: string) => await m.auth.loginWithMagicLink({ email, showUI: false }),
    [m.auth]
  );
}

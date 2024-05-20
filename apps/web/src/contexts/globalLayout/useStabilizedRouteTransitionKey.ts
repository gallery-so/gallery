import { useRouter } from 'next/router';
import { useMemo } from 'react';

/**
 * The main purpose of this hook is to prevent triggering side effects that are normally
 * caused by page transitions. Specifically:
 * 1) preventing content from fading in/out on certain route changes
 * 2) keeping modals open across certain route changes
 * 3) preventing scroll reset across certain route changes
 *
 * NOTE: lots of things can be improved about this, but it's too much of a headache to fix rn
 */
export default function useStabilizedRouteTransitionKey() {
  const { asPath, pathname } = useRouter();

  const transitionAnimationKey = useMemo(() => {
    // keep location stable for paths containing "onboarding"
    if (pathname.includes('onboarding')) {
      return 'onboarding';
    }

    return asPath;
  }, [asPath, pathname]);

  return transitionAnimationKey;
}

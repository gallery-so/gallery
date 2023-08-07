import { useRouter } from 'next/router';

/**
 * The main purpose of this hook is to prevent triggering side effects that are normally
 * caused by page transitions. Specifically:
 * 1) preventing content from fading in/out on certain route changes
 * 2) keeping modals open across certain route changes
 * 3) preventing scroll reset across certain route changes
 *
 * NOTE: This used to be a massive conditional block but turns out we can `pathname` is
 * the magic value that remains stable and provides the behavior we're looking for
 */
export default function useStabilizedRouteTransitionKey() {
  const { pathname } = useRouter();

  const transitionAnimationKey = pathname;

  return transitionAnimationKey;
}

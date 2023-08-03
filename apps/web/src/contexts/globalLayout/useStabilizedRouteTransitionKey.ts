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
  const { asPath, pathname, query } = useRouter();

  const transitionAnimationKey = useMemo(() => {
    // if we're looking at the NFT detail modal from the user gallery page,
    // keep the location key static as to not trigger an animation
    if (pathname === '/[username]' && query.modal === 'true') {
      return `/${query.username}`;
    }
    // same logic for modal triggered from collection page
    if (pathname === '/[username]/galleries/[galleryId]' && query.modal === 'true') {
      return `/${query.username}/galleries/${query.galleryId}`;
    }
    // same logic for modal triggered from collection page
    if (pathname === '/[username]/[collectionId]' && query.modal === 'true') {
      return `/${query.username}/${query.collectionId}`;
    }
    if (pathname === '/[username]/activity' && query.modal === 'true') {
      return `/${query.username}/activity`;
    }

    // keep location stable for NFT detail pages
    if (pathname === '/[username]/[collectionId]/[tokenId]') {
      return `/${query.username}/${query.collectionId}`;
    }
    // keep location stable if settings modal is open
    if (query.settings === 'true') {
      return pathname;
    }
    return asPath;
  }, [asPath, pathname, query]);

  return transitionAnimationKey;
}

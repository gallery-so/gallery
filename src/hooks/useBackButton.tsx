import { useCanGoBack, useHistoryStack } from 'contexts/navigation/GalleryNavigationProvider';
import { useRouter } from 'next/router';
import { useCallback, useMemo } from 'react';

type Props = {
  username: string;
};

/**
 * This is a back button used in select locations to navigate back to the user's previous
 * location OR the user's main profile, depending on browser history.
 *
 * This is necessary because we need to use the browser's native `back` functionality where
 * possible (as opposed to direct `push` navigation) in order to maintain scroll position.
 */
export default function useBackButton({ username }: Props) {
  const { replace, back } = useRouter();
  const canGoBack = useCanGoBack();
  const historyStack = useHistoryStack();
  const previousRoute = historyStack[historyStack.length - 2];

  const isManuallyDisabled = useMemo(() => {
    // disable going back to the collection editor page
    if (previousRoute?.asPath.includes('/edit?collectionId=')) {
      return true;
    }
    // disable going back to the NFT detail page
    if (previousRoute?.pathname === '/[username]/[collectionId]/[nftId]') {
      return true;
    }
    // disable going back to a modal
    if (previousRoute?.query.modal === 'true') {
      return true;
    }
    return false;
  }, [previousRoute]);

  const handleBackClick = useCallback(
    (event?: React.MouseEvent<HTMLElement>) => {
      if (event?.metaKey) {
        window.open(`/${username}`);
        return;
      }

      if (!canGoBack || isManuallyDisabled) {
        // if the user arrived on the page via direct link, send them to the
        // owner's profile page (since there is no "previous page")
        void replace(`/${username}`);
      } else {
        // If the user has history in their stack, simply send them back to where they came from.
        // this ensures scroll position is maintained when going back (see: GalleryNavigationContext.tsx)
        back();
      }
    },
    [back, isManuallyDisabled, canGoBack, replace, username]
  );

  return handleBackClick;
}

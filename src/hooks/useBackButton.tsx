import { useCanGoBack, useHistoryStack } from 'contexts/navigation/GalleryNavigationProvider';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

type Props = {
  username: string;
};

// This is a back button used on the CollectionGalleryPage or NftDetailPage to navigate back to
// where the user clicked in from.
// We have this because we to use the browser back functionality where possible instead of
// directly navigating back in order to maintain scroll position.
export default function useBackButton({ username }: Props) {
  const { replace, back } = useRouter();
  const canGoBack = useCanGoBack();
  const historyStack = useHistoryStack();

  const previousRoute = historyStack[historyStack.length - 2];
  const backDisabled = previousRoute?.includes('/edit?collectionId=');

  const handleBackClick = useCallback(
    (event?: React.MouseEvent<HTMLElement>) => {
      if (event?.metaKey) {
        window.open(`/${username}`);
        return;
      }

      // If the user has a different page in their history such as the Edit Collection Page, don't use back()

      if (!canGoBack || backDisabled) {
        // if the user arrived on the page via direct link, send them to the
        // owner's profile page (since there is no "previous page")
        // NOTE: this scheme will have to change if we no longer have the
        // username included in the URL
        void replace(`/${username}`);
      } else {
        // If the user has history in their stack, simply send them back to where they came from.
        // this ensures scroll position is maintained when going back (see: GalleryNavigationContext.tsx)
        back();
      }
    },
    [back, backDisabled, canGoBack, replace, username]
  );

  return handleBackClick;
}

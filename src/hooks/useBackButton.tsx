import { useCanGoBack } from 'contexts/navigation/GalleryNavigationProvider';
import { useRouter } from 'next/router';
import { useCallback } from 'react';

type Props = {
  username: string;
};

export default function useBackButton({ username }: Props) {
  const { replace, back } = useRouter();
  const canGoBack = useCanGoBack();

  const handleBackClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (event.metaKey) {
        window.open(`/${username}`);
        return;
      }

      if (canGoBack) {
        // If the user has history in their stack, simply send them back to where they came from.
        // this ensures scroll position is maintained when going back (see: GalleryNavigationContext.tsx)
        back();
      } else {
        // if the user arrived on the page via direct link, send them to the
        // owner's profile page (since there is no "previous page")
        // NOTE: this scheme will have to change if we no longer have the
        // username included in the URL
        void replace(`/${username}`);
      }
    },
    [back, canGoBack, replace, username]
  );

  return handleBackClick;
}

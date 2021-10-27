import { navigate } from '@reach/router';

// navigates to the given url. Opens in new tab if meta key (command on mac) is pressed
export function navigateToUrl(url: string, event: React.MouseEvent<HTMLElement>) {
  if (event.metaKey) {
    window.open(url);
  } else {
    void navigate(url);
  }
}

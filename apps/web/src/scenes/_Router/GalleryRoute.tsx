import { useEffect } from 'react';

import GlobalFooter from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useGlobalLayoutActions } from '~/contexts/globalLayout/GlobalLayoutContext';

export type Props = {
  element: JSX.Element;
  banner?: boolean;
  navbar: JSX.Element | false;
  footer?: boolean;
};

export default function GalleryRoute({
  element,
  navbar = false,
  footer = true,
  banner = true,
}: Props) {
  const { setContent } = useGlobalLayoutActions();
  const { setBannerVisible } = useGlobalLayoutActions();

  useEffect(() => {
    setBannerVisible(banner);
    if (navbar) {
      setContent(navbar);
    }
  }, [banner, navbar, setBannerVisible, setContent]);

  return (
    <>
      {element}
      {
        // we render the footer here, instead of `GalleryLayoutContext`, because we
        // don't need to keep it fixed + visible as we navigate from page to page.
        // the navbar, on the other hand, is rendered @ GalleryLayoutContext since
        // there are cases in which it needs to carry through transitions.
        footer && <GlobalFooter />
      }
    </>
  );
}

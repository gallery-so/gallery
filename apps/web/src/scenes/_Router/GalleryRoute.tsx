import { useEffect } from 'react';

import GlobalFooter from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useGlobalLayoutActions } from '~/contexts/globalLayout/GlobalLayoutContext';

export type Props = {
  element: JSX.Element;
  banner?: boolean;
  navbar: JSX.Element | false;
  sidebar?: JSX.Element | false;
  footer?: boolean;
};

export default function GalleryRoute({
  element,
  banner = true,
  navbar = false,
  sidebar = false,
  footer = true,
}: Props) {
  const { setTopNavContent, setSidebarContent } = useGlobalLayoutActions();
  const { setBannerVisible } = useGlobalLayoutActions();

  useEffect(() => {
    setBannerVisible(banner);
    setTopNavContent(navbar);
    if (sidebar) {
      setSidebarContent(sidebar);
    }
  }, [banner, navbar, setBannerVisible, setSidebarContent, setTopNavContent, sidebar]);

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

import { useEffect } from 'react';

import GlobalFooter from '~/contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useGlobalLayoutActions } from '~/contexts/globalLayout/GlobalLayoutContext';

export type Props = {
  element: JSX.Element;
  banner?: boolean;
  navbar: JSX.Element | false;
  sidebar?: JSX.Element | false;
  footer?: boolean;
  footerTheme?: 'dark' | 'light';
};

export default function GalleryRoute({
  element,
  banner = true,
  navbar = false,
  sidebar = false,
  footer = true,
  footerTheme,
}: Props) {
  const { setTopNavContent, setSidebarContent, setIsBannerVisible } = useGlobalLayoutActions();

  useEffect(() => {
    setIsBannerVisible(banner);
    setTopNavContent(navbar || null);
    setSidebarContent(sidebar || null);
  }, [banner, navbar, sidebar, setIsBannerVisible, setTopNavContent, setSidebarContent]);

  return (
    <>
      {element}
      {
        // we render the footer here, instead of `GalleryLayoutContext`, because we
        // don't need to keep it fixed + visible as we navigate from page to page.
        // the navbar, on the other hand, is rendered @ GalleryLayoutContext since
        // there are cases in which it needs to carry through transitions.
        footer && <GlobalFooter theme={footerTheme} />
      }
    </>
  );
}

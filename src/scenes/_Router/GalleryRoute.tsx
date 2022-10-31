import GlobalFooter from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect, useState } from 'react';
import { useNavbarEffect } from 'contexts/globalLayout/useNavbarEffect';

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
  const [mounted, setMounted] = useState(false);
  const { setContent } = useGlobalLayoutActions();
  const { setBannerVisible, setNavbarVisible } = useGlobalLayoutActions();

  useEffect(() => {
    setBannerVisible(banner);
    setMounted(true);
  }, [banner, navbar, setBannerVisible, setContent, setNavbarVisible]);

  useNavbarEffect(() => {
    if (navbar === false) {
      setNavbarVisible(false);
    } else {
      setContent(navbar);
      setNavbarVisible(true);
    }
  });

  return mounted ? (
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
  ) : null;
}

import GlobalFooter from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useContext, useEffect, useLayoutEffect, useState } from 'react';
import { TransitionStateContext } from 'components/FadeTransitioner/FadeTransitioner';

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

  const transitionState = useContext(TransitionStateContext);
  useLayoutEffect(() => {
    if (transitionState === 'entering' || transitionState === 'entered') {
      if (navbar === false) {
        setNavbarVisible(false);
      } else {
        setContent(navbar);
        setNavbarVisible(true);
      }
    }
  }, [navbar, setContent, setNavbarVisible, transitionState]);

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

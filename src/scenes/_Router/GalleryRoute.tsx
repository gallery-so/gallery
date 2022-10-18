import GlobalFooter from 'contexts/globalLayout/GlobalFooter/GlobalFooter';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect, useState } from 'react';

export type Props = {
  element: JSX.Element;
  banner?: boolean;
  navbar?: JSX.Element | false;
  footer?: boolean;
};

export default function GalleryRoute({ element, navbar, footer = true, banner = true }: Props) {
  const [mounted, setMounted] = useState(false);
  const { setBannerVisible, setNavbarVisible } = useGlobalLayoutActions();

  useEffect(() => {
    setBannerVisible(banner);
    setMounted(true);

    if (navbar === false) {
      setNavbarVisible(false);
    } else {
      setNavbarVisible(true);
    }
    // we only want these properties to be set on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log({ navbar });

  return mounted ? (
    <>
      {navbar ? navbar : null}
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

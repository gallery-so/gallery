import GlobalFooter from 'components/core/Page/GlobalFooter';
import { useGlobalLayoutActions } from 'contexts/globalLayout/GlobalLayoutContext';
import { useEffect, useState } from 'react';

export type Props = {
  element: JSX.Element;
  banner?: boolean;
  navbar?: boolean;
  footer?: boolean;
};

export default function GalleryV2Route({
  element,
  navbar = true,
  footer = true,
  banner = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const { setBannerVisible, setNavbarVisible } = useGlobalLayoutActions();

  useEffect(() => {
    setBannerVisible(banner);
    setNavbarVisible(navbar);
    setMounted(true);
    // we only want these properties to be set on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

import GlobalFooter from 'components/core/Page/GlobalFooter';
import GlobalNavbar from 'components/core/Page/GlobalNavbar/GlobalNavbar';
import Spacer from 'components/core/Spacer/Spacer';
import { useMemo } from 'react';

export type LayoutProps = {
  // whether the navbar should be rendered
  navbar?: boolean;
  // whether the footer should be rendered
  // if false, this will override both props below
  footer?: boolean;
  // whether the footer should be rendered within view
  footerVisibleWithinView?: boolean;
  // whether the footer should be rendered out of view
  footerVisibleOutOfView?: boolean;
  // whether to show nothing but the component (not even fillers)
  // useful for truly custom pages
  freshLayout?: boolean;
};

export type GalleryRouteProps = {
  element: JSX.Element;
} & LayoutProps;

// fills up the space where the navbar or footer would be
export const Filler = () => <Spacer height={80} />;

export default function GalleryRoute({
  element,
  freshLayout = false,
  navbar = true,
  footer = true,
  footerVisibleWithinView = true,
  footerVisibleOutOfView = false,
}: GalleryRouteProps) {
  const navbarComponent = useMemo(() => {
    if (navbar) {
      return <GlobalNavbar />;
    }

    return <Filler />;
  }, [navbar]);

  const footerComponent = useMemo(() => {
    if (!footer) {
      return <Filler />;
    }

    if (footerVisibleOutOfView) {
      return (
        <>
          <Filler />
          <GlobalFooter />
        </>
      );
    }

    if (footerVisibleWithinView) {
      return <GlobalFooter />;
    }
  }, [footer, footerVisibleOutOfView, footerVisibleWithinView]);

  if (freshLayout) {
    return element;
  }

  return (
    <>
      {navbarComponent}
      {element}
      {footerComponent}
    </>
  );
}

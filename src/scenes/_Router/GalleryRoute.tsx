// uncomment if we need this next time
// import Banner from 'components/Banner/Banner';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_FOOTER_HEIGHT_MOBILE } from 'components/core/Page/constants';
import GlobalFooter from 'components/core/Page/GlobalFooter';
import GlobalNavbar from 'components/core/Page/GlobalNavbar/GlobalNavbar';
import Spacer from 'components/core/Spacer/Spacer';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useMemo } from 'react';

export type LayoutProps = {
  // whether the navbar should be rendered
  navbar?: boolean;
  // whether the footer should be rendered
  // if false, this will override both props below
  footer?: boolean;
  // whether the footer should be fixed to bottom of page
  footerIsFixed?: boolean;
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
export type FillerProps = { tallVariant?: boolean };

export const Filler = ({ tallVariant = false }: FillerProps) => (
  <Spacer height={tallVariant ? GLOBAL_FOOTER_HEIGHT_MOBILE : GLOBAL_FOOTER_HEIGHT} />
);

export default function GalleryRoute({
  element,
  freshLayout = false,
  navbar = true,
  footer = true,
  footerIsFixed = false,
  footerVisibleWithinView = true,
  footerVisibleOutOfView = false,
}: GalleryRouteProps) {
  const isMobile = useIsMobileWindowWidth();

  const navbarComponent = useMemo(() => {
    if (navbar) {
      return <GlobalNavbar />;
    }

    return <Filler tallVariant={isMobile} />;
  }, [navbar, isMobile]);

  const footerComponent = useMemo(() => {
    if (!footer) {
      return <Filler />;
    }

    if (footerVisibleOutOfView) {
      return (
        <>
          <Filler tallVariant={isMobile} />
          <GlobalFooter isFixed={footerIsFixed} />
        </>
      );
    }

    if (footerVisibleWithinView) {
      return <GlobalFooter isFixed={footerIsFixed} />;
    }
  }, [footer, footerVisibleOutOfView, footerVisibleWithinView, footerIsFixed, isMobile]);

  const banner = useMemo(
    () =>
      // uncomment if we need this next time
      // <Banner text="We are currently migrating our backend systems to improve reliability. You will not be able to update your gallery for the next 1-2 hours (until 1 AM EST)." />
      null,
    []
  );

  if (freshLayout) {
    return (
      <>
        {banner}
        {element}
      </>
    );
  }

  return (
    <>
      {banner}
      {navbarComponent}
      {element}
      {footerComponent}
    </>
  );
}

import Banner from 'components/Banner/Banner';
import { FeatureFlag } from 'components/core/enums';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_FOOTER_HEIGHT_MOBILE } from 'components/core/Page/constants';
import GlobalFooter from 'components/core/Page/GlobalFooter';
import GlobalNavbar from 'components/core/Page/GlobalNavbar/GlobalNavbar';
import Spacer from 'components/core/Spacer/Spacer';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import PosterBanner from 'scenes/PosterPage/PosterBanner';
import { isFeatureEnabled } from 'utils/featureFlag';
import { GalleryRouteFragment$key } from '__generated__/GalleryRouteFragment.graphql';

export type LayoutProps = {
  // whether the banner should be rendered
  banner?: boolean;
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
  queryRef: GalleryRouteFragment$key;
} & LayoutProps;

// fills up the space where the navbar or footer would be
export type FillerProps = { tallVariant?: boolean };

export const Filler = ({ tallVariant = false }: FillerProps) => (
  <Spacer height={tallVariant ? GLOBAL_FOOTER_HEIGHT_MOBILE : GLOBAL_FOOTER_HEIGHT} />
);

export default function GalleryRoute({
  queryRef,
  element,
  freshLayout = false,
  navbar = true,
  footer = true,
  banner = true,
  footerIsFixed = false,
  footerVisibleWithinView = true,
  footerVisibleOutOfView = false,
}: GalleryRouteProps) {
  const query = useFragment(
    graphql`
      fragment GalleryRouteFragment on Query {
        ...GlobalNavbarFragment
        ...BannerFragment
      }
    `,
    queryRef
  );

  const isMobile = useIsMobileWindowWidth();

  const navbarComponent = useMemo(() => {
    if (navbar) {
      return <GlobalNavbar queryRef={query} />;
    }

    return <Filler tallVariant={isMobile && footer} />;
  }, [navbar, isMobile, footer, query]);

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

  const bannerComponent = useMemo(() => {
    if (!banner) {
      return;
    }

    return isFeatureEnabled(FeatureFlag.POSTER_PAGE) ? (
      <PosterBanner queryRef={query} />
    ) : (
      <Banner text="" queryRef={query} />
    );
  }, [banner, query]);

  if (freshLayout) {
    return (
      <>
        {bannerComponent}
        {element}
      </>
    );
  }

  return (
    <>
      {bannerComponent}
      {navbarComponent}
      {element}
      {footerComponent}
    </>
  );
}

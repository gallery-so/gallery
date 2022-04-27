import Banner from 'components/Banner/Banner';
import { FeatureFlag } from 'components/core/enums';
import NavLink from 'components/core/NavLink/NavLink';
import { GLOBAL_FOOTER_HEIGHT, GLOBAL_FOOTER_HEIGHT_MOBILE } from 'components/core/Page/constants';
import GlobalFooter from 'components/core/Page/GlobalFooter';
import GlobalNavbar from 'components/core/Page/GlobalNavbar/GlobalNavbar';
import Spacer from 'components/core/Spacer/Spacer';
import useTimer from 'hooks/useTimer';
import { useIsMobileWindowWidth } from 'hooks/useWindowSize';
import { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';
import { isFeatureEnabled } from 'utils/featureFlag';
import { GalleryRouteFragment$key } from '__generated__/GalleryRouteFragment.graphql';

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

  const { days, hours, minutes, seconds } = useTimer();

  const countdownTimer = useMemo(() => {
    return `Ends in ${days}:${hours}:${minutes}:${seconds}`;
  }, [seconds]);

  const isMobile = useIsMobileWindowWidth();

  const navbarComponent = useMemo(() => {
    if (navbar) {
      return <GlobalNavbar queryRef={query} />;
    }

    return <Filler tallVariant={isMobile} />;
  }, [navbar, isMobile, query]);

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

  const banner = useMemo(() => {
    return isFeatureEnabled(FeatureFlag.POSTER_PAGE) ? (
      <Banner
        title={countdownTimer}
        text="Thank you for being a member of Gallery. Celebrate our new brand with us by signing our 2022 Community Poster that we will mint as an NFT."
        queryRef={query}
        localStorageKey="gallery-poster-banner"
      >
        <NavLink to="/object006">Sign Poster</NavLink>
      </Banner>
    ) : (
      <Banner text="" queryRef={query} />
    );
  }, [query]);

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

import { RouteComponentProps } from '@reach/router';
import GlobalFooter from 'components/core/Page/GlobalFooter';
import GlobalNavbar from 'components/core/Page/GlobalNavbar/GlobalNavbar';
import Spacer from 'components/core/Spacer/Spacer';
import { ComponentType, useMemo } from 'react';

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
  component: ComponentType<RouteComponentProps>;
} & LayoutProps & RouteComponentProps;

// fills up the space where the navbar or footer would be
export const Filler = () => <Spacer height={80} />;

export default function GalleryRoute({
  component: RouteComponent,
  freshLayout = false,
  navbar = true,
  footer = true,
  footerVisibleWithinView = true,
  footerVisibleOutOfView = false,
  ...routeProps
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
          <GlobalFooter/>
        </>
      );
    }

    if (footerVisibleWithinView) {
      return <GlobalFooter />;
    }
  }, [footer, footerVisibleOutOfView, footerVisibleWithinView]);

  if (freshLayout) {
    return <RouteComponent {...routeProps} />;
  }

  return (
    <>
      {navbarComponent}
      <RouteComponent {...routeProps} />
      {footerComponent}
    </>
  );
}


import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { MouseEvent, MouseEventHandler, ReactNode, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryElementTrackingProps, useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';
import { normalizeUrl } from '~/utils/normalizeUrl';

import { BODY_FONT_FAMILY } from '../Text/Text';
import transitions from '../transitions';
import VerifyNavigationPopover from './VerifyNavigationPopover';

export type InteractiveLinkProps = {
  children: ReactNode;
  className?: string;
  to?: Route;
  href?: string;
  onClick?: MouseEventHandler;
  // allows the parent to override default link styles
  inheritLinkStyling?: boolean;
  // open the link in a new tab or not
  target?: HTMLAnchorElement['target'];
} & {
  // make tracking props optional given `InteractiveLink` often has
  // a parent element with embedded tracking, and we auto-track links
  eventElementId?: GalleryElementTrackingProps['eventElementId'];
  eventName?: GalleryElementTrackingProps['eventName'];
  eventContext?: GalleryElementTrackingProps['eventContext'];
} & Omit<GalleryElementTrackingProps, 'eventElementId' | 'eventName' | 'eventContext'>;

export default function InteractiveLink({
  to,
  href,
  children,
  className,
  onClick,
  inheritLinkStyling = false,
  target = '_blank',
  eventElementId = 'Unlabeled Link',
  eventName = 'Unlabeled Link Click',
  eventContext,
  eventFlow,
  properties,
}: InteractiveLinkProps) {
  const track = useTrack();

  if (!to && !href && !onClick) {
    console.error('no link provided for InteractiveLink');
  }

  const normalizedUrl = useMemo(() => normalizeUrl({ to, href }), [href, to]);

  const handleClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();

      track('Link Click', {
        to: normalizedUrl,
        needsVerification: false,
        id: eventElementId,
        name: eventName,
        context: eventContext,
        flow: eventFlow,
        ...properties,
      });

      onClick?.(event);
    },
    [eventContext, eventElementId, eventFlow, eventName, normalizedUrl, onClick, properties, track]
  );

  if (to) {
    return (
      <Link href={to} passHref legacyBehavior>
        <StyledAnchor
          onClick={handleClick}
          className={className}
          inheritStyles={inheritLinkStyling}
        >
          {children}
        </StyledAnchor>
      </Link>
    );
  }

  if (href) {
    return (
      <StyledAnchor
        href={href}
        target={target}
        rel="noreferrer"
        onClick={handleClick}
        className={className}
        inheritStyles={inheritLinkStyling}
      >
        {children}
      </StyledAnchor>
    );
  }

  if (onClick) {
    return (
      <StyledAnchor onClick={handleClick} className={className} inheritStyles={inheritLinkStyling}>
        {children}
      </StyledAnchor>
    );
  }

  return null;
}

export function InteractiveLinkNeedsVerification({
  inheritLinkStyling = false,
  href,
  children,
}: {
  inheritLinkStyling?: boolean;
  href: string;
  children: ReactNode;
}) {
  const { showModal } = useModalActions();
  const track = useTrack();

  const handleClick = useCallback(
    (e: MouseEvent, href: string) => {
      e.preventDefault();

      track('Link Click', {
        to: href,
        needsVerification: true,
      });

      showModal({
        content: <VerifyNavigationPopover href={href} />,
        isFullPage: false,
        headerText: 'Leaving gallery.so?',
      });
    },
    [showModal, track]
  );
  return (
    <InteractiveLink
      inheritLinkStyling={inheritLinkStyling}
      onClick={(e) => {
        handleClick(e, href);
      }}
    >
      {children}
    </InteractiveLink>
  );
}

export const StyledAnchor = styled.a<{ disabled?: boolean; inheritStyles?: boolean }>`
  color: ${colors.shadow};
  text-decoration: none;
  font-family: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : BODY_FONT_FAMILY)};
  font-size: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : '14px')};
  line-height: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : '18px')};
  transition: color ${transitions.cubic};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  &:hover {
    text-decoration: none;
    color: ${colors.black['800']};
  }
`;

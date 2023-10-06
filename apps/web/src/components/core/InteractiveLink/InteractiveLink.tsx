import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { MouseEvent, MouseEventHandler, ReactNode, useCallback } from 'react';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

import { BODY_FONT_FAMILY } from '../Text/Text';
import transitions from '../transitions';
import NavigateConfirmation from './NavigateConfirmation';

export type InteractiveLinkProps = {
  to?: Route;
  href?: string;
  children: ReactNode;
  size?: string; // 'M', 'L', 'XL'
  className?: string;
  onClick?: MouseEventHandler;
  // allows the parent to override default link styles
  inheritLinkStyling?: boolean;
  // open the link in a new tab or not
  target?: HTMLAnchorElement['target'];
};

export default function InteractiveLink({
  to,
  href,
  children,
  className,
  onClick,
  inheritLinkStyling = false,
  target = '_blank',
}: InteractiveLinkProps) {
  const track = useTrack();

  const handleClick = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();

      track('Link Click', {
        to: to || href,
        needsVerification: false,
      });

      if (onClick) {
        onClick(event);
      }
    },
    [href, onClick, to, track]
  );

  if (!to && !href && !onClick) {
    console.error('no link provided for InteractiveLink');
  }

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
        content: <NavigateConfirmation href={href} />,
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

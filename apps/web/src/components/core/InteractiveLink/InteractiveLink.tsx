import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { MouseEvent, MouseEventHandler, ReactNode, useCallback } from 'react';
import styled from 'styled-components';

import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useModalActions } from '~/contexts/modal/ModalContext';

import colors from '../colors';
import { BODY_FONT_FAMILY } from '../Text/Text';
import transitions from '../transitions';
import NavigateConfirmation from './NavigateConfirmation';

type InteractiveLinkProps = {
  to?: Route;
  href?: string;
  children: ReactNode;
  size?: string; // 'M', 'L', 'XL'
  className?: string;
  disabled?: boolean;
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
  disabled = false,
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
        if (disabled) return;
        onClick(event);
      }
    },
    [href, onClick, to, track, disabled]
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
      <StyledAnchor
        onClick={handleClick}
        className={className}
        disabled={disabled}
        inheritStyles={inheritLinkStyling}
      >
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
  color: ${({ disabled }) => (disabled ? colors.porcelain : colors.shadow)};
  text-decoration: underline;
  font-family: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : BODY_FONT_FAMILY)};
  font-size: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : '14px')};
  line-height: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : '18px')};
  transition: color ${transitions.cubic};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  &:hover {
    text-decoration: none;
    color: ${colors.offBlack};
  }
`;

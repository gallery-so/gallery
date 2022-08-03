import { ReactNode, useCallback } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { BODY_FONT_FAMILY } from '../Text/Text';
import colors from '../colors';
import transitions from '../transitions';
import { useModalActions } from 'contexts/modal/ModalContext';
import NavigateConfirmation from './NavigateConfirmation';

type InteractiveLinkProps = {
  to?: string;
  href?: string;
  children: ReactNode;
  size?: string; // 'M', 'L', 'XL'
  className?: string;
  disabled?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
  // allows the parent to override default link styles
  inheritLinkStyling?: boolean;
};

export default function InteractiveLink({
  to,
  href,
  children,
  className,
  disabled = false,
  onClick,
  inheritLinkStyling = false,
}: InteractiveLinkProps) {
  const track = useTrack();

  const handleClick = useCallback(
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
      <Link href={to} passHref>
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
        target="_blank"
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
    (e, href) => {
      e.preventDefault();

      track('Link Click', {
        to: href,
        needsVerification: true,
      });

      // FIXME: This conflicts with viewing the NFT preview page, because that is a modal.
      // So running `showModal` will close that preview modal, and then open the verify navigation modal.
      showModal({
        content: <NavigateConfirmation href={href} />,
        isFullPage: false,
        headerText: `Are you sure you want to navigate to ${href}?`,
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
  text-decoration: underline;
  color: ${({ disabled }) => (disabled ? colors.porcelain : colors.shadow)};
  transition: color ${transitions.cubic};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-family: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : BODY_FONT_FAMILY)};
  font-size: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : '14px')};
  line-height: ${({ inheritStyles }) => (inheritStyles ? 'inherit' : '18px')};

  &:hover {
    text-decoration: none;
    color: ${colors.offBlack};
  }
`;

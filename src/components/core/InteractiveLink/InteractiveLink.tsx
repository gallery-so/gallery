import { ReactNode, useCallback } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { BODY_FONT_FAMILY } from '../Text/Text';
import colors from '../colors';
import transitions from '../transitions';

type Props = {
  to?: string;
  href?: string;
  children: ReactNode;
  size?: string; // 'M', 'L', 'XL'
  className?: string;
  disabled?: boolean;
  onClick?: (event?: React.MouseEvent<HTMLElement>) => void;
};

export default function InteractiveLink({
  to,
  href,
  children,
  className,
  disabled = false,
  onClick,
}: Props) {
  const track = useTrack();

  const handleClick = useCallback(
    (event) => {
      event.stopPropagation();

      track('Link Click', {
        to: to || href,
      });

      if (onClick) {
        if (disabled) return;
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
      <Link href={to} passHref>
        <StyledAnchor onClick={handleClick} className={className}>
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
      >
        {children}
      </StyledAnchor>
    );
  }

  if (onClick) {
    return (
      <StyledAnchor onClick={handleClick} className={className} disabled={disabled}>
        {children}
      </StyledAnchor>
    );
  }

  return null;
}

const StyledAnchor = styled.a<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? colors.porcelain : colors.shadow)};
  text-decoration: underline;
  font-family: ${BODY_FONT_FAMILY};
  font-size: 14px;
  line-height: 18px;
  transition: color ${transitions.cubic};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:hover {
    text-decoration: none;
    color: ${colors.offBlack};
  }
`;

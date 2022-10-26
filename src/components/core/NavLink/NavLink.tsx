import { ReactNode, useCallback } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { BODY_FONT_FAMILY } from '../Text/Text';
import colors from '../colors';
import transitions from '../transitions';
import { Route } from 'nextjs-routes';

type Props = {
  to?: Route;
  href?: string;
  children: ReactNode;
  dataTestId?: string;
  className?: string;
  onClick?: () => void;
};

export default function NavLink({ to, href, children, dataTestId, className, onClick }: Props) {
  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Link Click', {
      to: to || href,
    });

    if (onClick) {
      onClick();
    }
  }, [href, to, track, onClick]);

  if (!to && !href) {
    console.error('no link provided for NavLink');
  }

  if (to) {
    return (
      <Link href={to} passHref>
        <StyledAnchor onClick={handleClick} data-testid={dataTestId} className={className}>
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
        data-testid={dataTestId}
        className={className}
      >
        {children}
      </StyledAnchor>
    );
  }

  return null;
}

const StyledAnchor = styled.a`
  color: inherit;
  text-decoration: none;
  font-family: ${BODY_FONT_FAMILY};
  font-size: 12px;
  line-height: 16px;
  color: ${colors.shadow};
  transition: color ${transitions.cubic};
  text-transform: uppercase;

  &:hover {
    color: ${colors.offBlack};
  }
`;

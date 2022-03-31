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
};

export default function NavLink({ to, href, children }: Props) {
  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Link Click', {
      to: to || href,
    });
  }, []);

  if (!to && !href) {
    console.error('no link provided for NavLink');
  }

  if (to) {
    return (
      <Link href={to} passHref>
        <StyledAnchor onClick={handleClick}>{children}</StyledAnchor>
      </Link>
    );
  }

  if (href) {
    return (
      <StyledAnchor href={href} target="_blank" rel="noreferrer" onClick={handleClick}>
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
  color: ${colors.metal};
  transition: color ${transitions.cubic};

  &:hover {
    color: ${colors.offBlack};
  }
`;

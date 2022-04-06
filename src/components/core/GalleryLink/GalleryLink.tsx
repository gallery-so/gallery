import { ReactNode, useCallback } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { useTrack } from 'contexts/analytics/AnalyticsContext';

type Props = {
  to?: string;
  href?: string;
  children: ReactNode;
  underlined?: boolean;
  underlineOnHover?: boolean;
};

export default function GalleryLink({
  to,
  href,
  children,
  underlined = true,
  underlineOnHover = false,
}: Props) {
  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Link Click', {
      to: to || href,
    });
  }, [href, to, track]);

  if (!to && !href) {
    console.error('no link provided for GalleryLink');
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
      <StyledAnchor
        href={href}
        target="_blank"
        $underlined={underlined}
        $underlineOnHover={underlineOnHover}
        onClick={handleClick}
      >
        {children}
      </StyledAnchor>
    );
  }

  return null;
}

type StyledProps = {
  $underlineOnHover?: boolean;
  $underlined?: boolean;
};

const StyledAnchor = styled.a<StyledProps>`
  color: inherit;
  ${(props) => !props.$underlined && 'text-decoration: none;'}

  &:hover {
    ${(prop) => prop.$underlineOnHover && 'text-decoration: underline'};
  }
`;

import Link from 'next/link';
import { Route } from 'nextjs-routes';
import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';

import { useTrack } from '~/shared/contexts/AnalyticsContext';

type Props = {
  className?: string;
  to?: Route;
  href?: string;
  children: ReactNode;
  underlined?: boolean;
  underlineOnHover?: boolean;
};

export default function GalleryLink({
  className,
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
      <Link href={to} passHref legacyBehavior>
        <StyledAnchor className={className} onClick={handleClick}>
          {children}
        </StyledAnchor>
      </Link>
    );
  }

  if (href) {
    return (
      <StyledAnchor
        className={className}
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

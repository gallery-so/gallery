import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';

type Props = {
  children: ReactNode;
  href: string;
};

// All links should be a tags but we on our app we sometimes use onClicks to navigate.
// This component wraps an <a> tag around any component like a button that redirects onClick, so that we properly have hrefs for elements that trigger navigation.
export default function SuppressedHrefWrapper({ children, href }: Props) {
  const handleClick = useCallback((e) => {
    e.preventDefault();
  }, []);
  return (
    <StyledLink href={href} onClick={handleClick}>
      {children}
    </StyledLink>
  );
}

const StyledLink = styled.a`
  text-decoration: none;
`;

import { useTrack } from 'contexts/analytics/AnalyticsContext';
import { useRouter } from 'next/router';
import { useCallback } from 'react';
import SecondaryGLogoIcon from 'src/icons/SecondaryGLogoIcon';
import styled from 'styled-components';

export default function NavbarGLink() {
  const { push } = useRouter();
  const track = useTrack();
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault();
      track('Feed: Clicked navbar entry point');
      void push('/home');
    },
    [push, track]
  );

  return (
    <StyledNavbarGLink href="/home" onClick={handleClick}>
      <StyledSecondaryGLogoIcon />
    </StyledNavbarGLink>
  );
}
const StyledNavbarGLink = styled.a`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const StyledSecondaryGLogoIcon = styled(SecondaryGLogoIcon)`
  width: 12px;
  height: 16px;
`;

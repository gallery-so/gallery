import { useTrack } from 'contexts/analytics/AnalyticsContext';
import SecondaryGLogoIcon from 'src/icons/SecondaryGLogoIcon';
import styled from 'styled-components';
import { UnstyledLink } from './core/Link/UnstyledLink';

export default function NavbarGLink() {
  const track = useTrack();
  return (
    <StyledNavbarGLink href="/home" onClick={() => track('Feed: Clicked navbar entry point')}>
      <StyledSecondaryGLogoIcon />
    </StyledNavbarGLink>
  );
}

const StyledNavbarGLink = styled(UnstyledLink)`
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

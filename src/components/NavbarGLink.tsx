import SecondaryGLogoIcon from 'src/icons/SecondaryGLogoIcon';
import styled from 'styled-components';

export default function NavbarGLink() {
  return (
    <StyledNavbarGLink href="/home">
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

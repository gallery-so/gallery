import { useCallback } from 'react';
import { Link as RouterLink } from '@reach/router';
import styled from 'styled-components';
import { Title, Text } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Dropdown from 'components/core/Dropdown/Dropdown';
import TextButton from 'components/core/Button/TextButton';
import { useModal } from 'contexts/modal/ModalContext';
import EditUserInfoModal from './EditUserInfoModal';

// TODO: delete this once we hav a working backend
const ADDRESSES = {
  mikey: '0xBb3F043290841B97b9C92F6Bc001a020D4B33255',
  robin: '0x70d04384b5c3a466ec4d8cfb8213efc31c6a9d15',
};

type Props = {
  usernameOrWalletAddress: string;
};

function Header({ usernameOrWalletAddress }: Props) {
  const { showModal } = useModal();

  const handleEditNameClick = useCallback(() => {
    showModal(<EditUserInfoModal />);
  }, [showModal]);

  return (
    <StyledHeader>
      <StyledLeftContainer>
        <Title>{usernameOrWalletAddress}</Title>
        <Spacer height={20} />
        <StyledUserDetails>
          <Text color={colors.gray50}>Collector Since Mar 2021</Text>
          <Text color={colors.gray50}>
            I make cool 3d loops Black small square
          </Text>
          <Text color={colors.gray50}>
            http://superrare.co/rogerkilimanjaro... Black small square
          </Text>
        </StyledUserDetails>
      </StyledLeftContainer>
      <StyledRightContainer>
        <Dropdown mainText="Edit Profile">
          <TextButton
            text={`Edit name & Bio`}
            onClick={handleEditNameClick}
          ></TextButton>
        </Dropdown>
      </StyledRightContainer>
    </StyledHeader>
  );
}

const StyledHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  width: 100%;

  max-width: 1024px; // TODO: make this responsive - this is shared with body
`;

const StyledLeftContainer = styled.div``;

const StyledUserDetails = styled.div``;

const StyledRightContainer = styled.div`
  display: flex;
`;

export default Header;

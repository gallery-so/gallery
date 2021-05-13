import { useCallback } from 'react';
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
      <Title>{usernameOrWalletAddress}</Title>
      <Spacer height={36} />
      <StyledUserDetails>
        <StyledLeftContainer>
          {/* TODO: won't be able to determine `MemberSince` unless we crawl blockchain 
          <Text color={colors.gray50}>Collector Since Mar 2021</Text>
          */}

          {/* TODO: handle multi-line descriptions from the server */}
          <Text color={colors.gray50}>
            French Graphic Designer + Digital Artist Sparkles Founder of
            @healthedeal
          </Text>
          <Text color={colors.gray50}>
            Sparkles lorem ipsum sit dolor http://superrare.co/maalavidaa
            Sparkles Shop
          </Text>
          <Text color={colors.gray50}>
            & More → http://linktr.ee/maalavidaa
          </Text>
        </StyledLeftContainer>
        <StyledRightContainer>
          <Dropdown mainText="Edit Profile">
            <TextButton
              text={`Edit name & Bio`}
              onClick={handleEditNameClick}
            />
          </Dropdown>
        </StyledRightContainer>
      </StyledUserDetails>
    </StyledHeader>
  );
}

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
`;

const StyledUserDetails = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledLeftContainer = styled.div``;

const StyledRightContainer = styled.div`
  display: flex;
`;

export default Header;

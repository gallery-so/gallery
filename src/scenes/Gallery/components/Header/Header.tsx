import { useCallback } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { Display, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Dropdown from 'components/core/Dropdown/Dropdown';
import TextButton from 'components/core/Button/TextButton';
import { useModal } from 'contexts/modal/ModalContext';
import EditUserInfoModal from './EditUserInfoModal';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';

type Props = {
  usernameOrWalletAddress: string;
};

function Header({ usernameOrWalletAddress }: Props) {
  const isAuthenticated = useIsAuthenticated();
  const { showModal } = useModal();

  const handleEditNameClick = useCallback(() => {
    showModal(<EditUserInfoModal />);
  }, [showModal]);

  const handleEditGalleryClick = useCallback(() => {
    navigate('/edit');
  }, []);

  return (
    <StyledHeader>
      <Display>{usernameOrWalletAddress}</Display>
      <Spacer height={36} />
      <StyledUserDetails>
        <StyledLeftContainer>
          {/* TODO: won't be able to determine `MemberSince` unless we crawl blockchain 
          <Text color={colors.gray50}>Collector Since Mar 2021</Text>
          */}

          {/* TODO__v1: handle multi-line descriptions from the server */}
          <BodyRegular color={colors.gray50}>
            French Graphic Designer + Digital Artist Sparkles Founder of
            @healthedeal
          </BodyRegular>
          <BodyRegular color={colors.gray50}>
            Sparkles lorem ipsum sit dolor http://superrare.co/maalavidaa
            Sparkles Shop
          </BodyRegular>
          <BodyRegular color={colors.gray50}>
            & More → http://linktr.ee/maalavidaa
          </BodyRegular>
        </StyledLeftContainer>
        {isAuthenticated && (
          <StyledRightContainer>
            <Dropdown mainText="Edit Profile">
              <TextButton
                text="Edit name & Bio"
                onClick={handleEditNameClick}
                underlineOnHover
              />
              <Spacer height={12} />
              <TextButton
                text="Edit Gallery"
                onClick={handleEditGalleryClick}
                underlineOnHover
              />
            </Dropdown>
          </StyledRightContainer>
        )}
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

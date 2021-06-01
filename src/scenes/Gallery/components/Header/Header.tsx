import { useCallback } from 'react';
import { navigate } from '@reach/router';
import styled from 'styled-components';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import Dropdown from 'components/core/Dropdown/Dropdown';
import TextButton from 'components/core/Button/TextButton';
import { useModal } from 'contexts/modal/ModalContext';
import EditUserInfoModal from './EditUserInfoModal';
import useIsAuthenticated from 'contexts/auth/useIsAuthenticated';
import { User } from 'types/User';

type Props = {
  user: User;
};

function Header({ user }: Props) {
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
      <Subdisplay>{user.displayName}</Subdisplay>
      <Spacer height={12} />
      <StyledUserDetails>
        {isAuthenticated && (
          <StyledRow>
            <StyledRightContainer>
              <Dropdown mainText="Edit Profile">
                <TextButton
                  text="Edit Gallery"
                  onClick={handleEditGalleryClick}
                  underlineOnHover
                />
                <Spacer height={12} />
                <TextButton
                  text="Edit name & Bio"
                  onClick={handleEditNameClick}
                  underlineOnHover
                />
              </Dropdown>
            </StyledRightContainer>
          </StyledRow>
        )}
        <Spacer height={18} />
        <StyledLeftContainer>
          {/* TODO: won't be able to determine `MemberSince` unless we crawl blockchain 
            <BodyRegular color={colors.gray50}>Collector Since Mar 2021</BodyRegular>
          */}
          <StyledBodyRegular color={colors.gray50}>
            {user.description}
          </StyledBodyRegular>
        </StyledLeftContainer>
      </StyledUserDetails>
    </StyledHeader>
  );
}

const StyledRow = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;
`;

const StyledUserDetails = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const StyledLeftContainer = styled.div``;

const StyledBodyRegular = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-wrap;
`;

const StyledRightContainer = styled.div`
  display: flex;
`;

export default Header;

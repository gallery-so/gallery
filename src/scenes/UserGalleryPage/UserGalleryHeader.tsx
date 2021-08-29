import styled from 'styled-components';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { User } from 'types/User';

type Props = {
  user: User;
  isAuthenticatedUsersPage: boolean;
};

function UserGalleryHeader({ user, isAuthenticatedUsersPage }: Props) {
  return (
    <StyledUserGalleryHeader>
      <Subdisplay>{user.username}</Subdisplay>
      <Spacer height={12} />
      <StyledUserDetails>
        <Spacer height={18} />
        <StyledLeftContainer>
          {/* TODO: won't be able to determine `MemberSince` unless we crawl blockchain 
            <BodyRegular color={colors.gray50}>Collector Since Mar 2021</BodyRegular>
          */}
          <StyledBodyRegular color={colors.gray50}>
            {user.bio}
          </StyledBodyRegular>
        </StyledLeftContainer>
      </StyledUserDetails>
    </StyledUserGalleryHeader>
  );
}

const StyledUserGalleryHeader = styled.div`
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

export default UserGalleryHeader;

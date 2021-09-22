import styled from 'styled-components';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';
import { User } from 'types/User';
import { useMemo } from 'react';
import moment from 'moment';

type Props = {
  user: User;
  isAuthenticatedUsersPage: boolean;
};

function UserGalleryHeader({ user }: Props) {
  const formattedCreatedAt = useMemo(() => moment(user.created_at).format('MMMM YYYY'), [user.created_at]);
  return (
    <StyledUserGalleryHeader>
      <Subdisplay>{user.username}</Subdisplay>
      <Spacer height={8} />
      <StyledBodyRegular color={colors.gray50}>Curator since {formattedCreatedAt}</StyledBodyRegular>
      <Spacer height={8} />
      <StyledUserDetails>
        <StyledBodyRegular color={colors.gray50}>
          {user.bio}
        </StyledBodyRegular>
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
  width: 70%;
  word-break: break-word;
`;

const StyledBodyRegular = styled(BodyRegular)`
  /* ensures linebreaks are reflected in UI */
  white-space: pre-wrap;
`;

export default UserGalleryHeader;

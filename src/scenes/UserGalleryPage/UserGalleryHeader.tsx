import { useMemo } from 'react';
import styled from 'styled-components';
import unescape from 'lodash.unescape';
import { Subdisplay, BodyRegular } from 'components/core/Text/Text';
import Spacer from 'components/core/Spacer/Spacer';
import colors from 'components/core/colors';

type Props = {
  username: string;
  bio: string;
};

function UserGalleryHeader({ username, bio }: Props) {
  const unescapedBio = useMemo(() => unescape(bio), [bio]);

  return (
    <StyledUserGalleryHeader>
      <Subdisplay>{username}</Subdisplay>
      <Spacer height={8} />
      <StyledUserDetails>
        <StyledBodyRegular color={colors.gray50}>
          {unescapedBio}
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

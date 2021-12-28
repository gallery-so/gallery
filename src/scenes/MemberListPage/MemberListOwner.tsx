import styled from 'styled-components';
import { Heading } from 'components/core/Text/Text';
import { MembershipOwner } from 'types/MembershipTier';
import GalleryLink from 'components/core/GalleryLink/GalleryLink';
import breakpoints from 'components/core/breakpoints';

function MemberListOwner({ owner }: { owner: MembershipOwner }) {
  return (
    <StyledOwner>
      <GalleryLink to={`/${owner.username}`} underlined={false} underlineOnHover>
        <StyledUsername>{owner.username}</StyledUsername>
      </GalleryLink>
    </StyledOwner>
  );
}

const StyledOwner = styled.div`
  width: 50%;
  flex-shrink: 0;

  @media only screen and ${breakpoints.tablet} {
    width: 33%;
  }

  @media only screen and ${breakpoints.desktop} {
    width: 25%;
  }
`;

const StyledUsername = styled(Heading)`
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
`;

export default MemberListOwner;

import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

import { ProfilePicture } from '~/components/ProfilePicture/ProfilePicture';
import { NewTooltip } from '~/components/Tooltip/NewTooltip';
import { useTooltipHover } from '~/components/Tooltip/useTooltipHover';
import { SidebarPfpFragment$key } from '~/generated/SidebarPfpFragment.graphql';

type Props = {
  userRef: SidebarPfpFragment$key;
  onClick: () => void;
};

export default function SidebarPfp({ userRef, onClick }: Props) {
  const user = useFragment(
    graphql`
      fragment SidebarPfpFragment on GalleryUser {
        ...ProfilePictureFragment
      }
    `,
    userRef
  );
  const { floating, reference, getFloatingProps, getReferenceProps, floatingStyle } =
    useTooltipHover({ placement: 'right' });
  return (
    <StyledSidebarPfp onClick={onClick}>
      <StyledProfilePictureWrapper {...getReferenceProps()} ref={reference}>
        <ProfilePicture size="md" userRef={user} />
      </StyledProfilePictureWrapper>
      <NewTooltip {...getFloatingProps()} style={floatingStyle} ref={floating} text="My profile" />
    </StyledSidebarPfp>
  );
}

const StyledSidebarPfp = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const StyledProfilePictureWrapper = styled.div`
  &:hover {
    filter: brightness(90%);
  }
`;

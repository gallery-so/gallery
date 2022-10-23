import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ProfileDropdownFragment$key } from '__generated__/ProfileDropdownFragment.graphql';
import { ReactNode, useCallback, useState } from 'react';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { HStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { GLogo } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { Dropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Dropdown';

type ProfileDropdownProps = {
  queryRef: ProfileDropdownFragment$key;
  rightContent: ReactNode;
};

export function ProfileDropdown({ queryRef, rightContent }: ProfileDropdownProps) {
  const query = useFragment(
    graphql`
      fragment ProfileDropdownFragment on Query {
        ...DropdownFragment
      }
    `,
    queryRef
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogoClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  return (
    <Wrapper gap={8} align="center">
      <LogoContainer gap={4} role="button" onClick={handleLogoClick}>
        <NotificationsCircle />

        <HStack gap={2}>
          <GLogo />

          <NavDownArrow />
        </HStack>
      </LogoContainer>

      {rightContent && <SlashText>/</SlashText>}
      {rightContent}

      <Dropdown showDropdown={showDropdown} onClose={handleClose} queryRef={query} />
    </Wrapper>
  );
}

const NotificationsCircle = styled.div`
  width: 4px;
  height: 4px;
  background-color: ${colors.hyperBlue};
  border-radius: 99999px;
`;

const LogoContainer = styled(HStack)`
  cursor: pointer;
`;

const Wrapper = styled(HStack)`
  position: relative;
`;

const SlashText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 300;
  line-height: 21px;
`;

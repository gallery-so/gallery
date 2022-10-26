import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ProfileDropdownFragment$key } from '__generated__/ProfileDropdownFragment.graphql';
import { ReactNode, useCallback, useState } from 'react';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { HStack } from 'components/core/Spacer/Stack';
import styled from 'styled-components';
import { GLogo } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { Paragraph, TITLE_FONT_FAMILY } from 'components/core/Text/Text';
import { Dropdown } from 'contexts/globalLayout/GlobalNavbar/ProfileDropdown/Dropdown';
import { useRouter } from 'next/router';

type ProfileDropdownProps = {
  queryRef: ProfileDropdownFragment$key;
  rightContent?: ReactNode;
};

export function ProfileDropdown({ queryRef, rightContent }: ProfileDropdownProps) {
  const query = useFragment(
    graphql`
      fragment ProfileDropdownFragment on Query {
        viewer {
          ... on Viewer {
            __typename
          }
        }

        ...DropdownFragment
      }
    `,
    queryRef
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const { push } = useRouter();

  const handleLoggedInLogoClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleLoggedOutLogoClick = useCallback(() => {
    push({ pathname: '/home' });
  }, [push]);

  const handleClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  return (
    <Wrapper gap={8} align="center">
      {isLoggedIn ? (
        <LogoContainer gap={4} role="button" onClick={handleLoggedInLogoClick}>
          {/* Here for when we implement notifications */}
          {/*<NotificationsCircle />*/}

          <HStack gap={2}>
            <GLogo />

            <NavDownArrow />
          </HStack>
        </LogoContainer>
      ) : (
        <LogoContainer gap={4} role="button" onClick={handleLoggedOutLogoClick}>
          <GLogo />
        </LogoContainer>
      )}

      {rightContent && <SlashText>/</SlashText>}
      {rightContent}

      {isLoggedIn && (
        <Dropdown showDropdown={showDropdown} onClose={handleClose} queryRef={query} />
      )}
    </Wrapper>
  );
}

// const NotificationsCircle = styled.div`
//   width: 4px;
//   height: 4px;
//   background-color: ${colors.hyperBlue};
//   border-radius: 99999px;
// `;

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

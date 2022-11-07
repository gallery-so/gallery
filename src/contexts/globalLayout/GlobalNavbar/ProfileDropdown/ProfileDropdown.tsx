import { useRouter } from 'next/router';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { Paragraph, TITLE_FONT_FAMILY } from '~/components/core/Text/Text';
import { GLogo } from '~/contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import { NavDownArrow } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/NavDownArrow';
import { ProfileDropdownContent } from '~/contexts/globalLayout/GlobalNavbar/ProfileDropdown/ProfileDropdownContent';
import { ProfileDropdownFragment$key } from '~/generated/ProfileDropdownFragment.graphql';

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

        ...ProfileDropdownContentFragment
      }
    `,
    queryRef
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const { push, pathname, query: urlQuery } = useRouter();

  const handleLoggedInLogoClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleLoggedOutLogoClick = useCallback(() => {
    push({ pathname: '/home' });
  }, [push]);

  const handleClose = useCallback(() => {
    setShowDropdown(false);
  }, []);

  useEffect(
    function closeDropdownWhenRouteChanges() {
      handleClose();
    },
    [handleClose, pathname, urlQuery]
  );

  const isLoggedIn = query.viewer?.__typename === 'Viewer';

  return (
    <Wrapper gap={4} align="center">
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
        <ProfileDropdownContent
          showDropdown={showDropdown}
          onClose={handleClose}
          queryRef={query}
        />
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
  max-width: 100%;
`;

export const SlashText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 300;
  line-height: 21px;
`;

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { ProfileDropdownFragment$key } from '__generated__/ProfileDropdownFragment.graphql';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { NavDownArrow } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/NavDownArrow';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import styled, { css, keyframes } from 'styled-components';
import { GLogo } from 'contexts/globalLayout/GlobalNavbar/GalleryNavbar/GLogo';
import {
  BaseS,
  BODY_FONT_FAMILY,
  Paragraph,
  TITLE_FONT_FAMILY,
  TitleM,
} from 'components/core/Text/Text';
import colors from 'components/core/colors';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import Link from 'next/link';
import { useAuthActions } from 'contexts/auth/AuthContext';

type ProfileDropdownProps = {
  queryRef: ProfileDropdownFragment$key;
  rightContent: ReactNode;
};

export function ProfileDropdown({ queryRef, rightContent }: ProfileDropdownProps) {
  const query = useFragment(
    graphql`
      fragment ProfileDropdownFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const [showDropdown, setShowDropdown] = useState(false);

  const { handleLogout } = useAuthActions();

  const handleLogoClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleBackdropClick = useCallback(() => {
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
      <SlashText>/</SlashText>
      {rightContent}

      {/* Used to hijack click events on things outside of the dropdown */}
      {showDropdown && <Backdrop onClick={handleBackdropClick} />}

      <DropdownContainer gap={8} active={showDropdown}>
        <DropdownProfileSection gap={4}>
          <HStack gap={4} align="center">
            <UsernameText>{query.viewer?.user?.username}</UsernameText>
            <BaseS>•</BaseS>
            <BaseS>Profile</BaseS>
          </HStack>
          <StyledInteractiveLink to={'/edit'}>Edit Gallery</StyledInteractiveLink>
        </DropdownProfileSection>

        <VStack gap={4}>
          <DropdownItem>
            <DropdownLink href={'/home'}>HOME</DropdownLink>
          </DropdownItem>
        </VStack>

        <VStack gap={4}>
          <DropdownItem>
            <DropdownLink href={'/accounts'}>ACCOUNTS</DropdownLink>
          </DropdownItem>
          <DropdownItem>
            <DropdownLink href={'/shop'}>
              <HStack gap={8}>
                <span>SHOP</span>
                <StyledObjectsText>(OBJECTS)</StyledObjectsText>
              </HStack>
            </DropdownLink>
          </DropdownItem>
        </VStack>

        <VStack gap={4}>
          <DropdownItem onClick={handleLogout}>LOG OUT</DropdownItem>
        </VStack>
      </DropdownContainer>
    </Wrapper>
  );
}

const Backdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
`;

type DropdownLinkProps = { href: string; children: ReactNode };

function DropdownLink({ href, children }: DropdownLinkProps) {
  return (
    <Link href={href}>
      <StyledDropdownLink href={href}>{children}</StyledDropdownLink>
    </Link>
  );
}

const StyledDropdownLink = styled.a`
  color: #808080;
  text-decoration: none;
`;

const StyledObjectsText = styled(TitleM)`
  font-family: 'GT Alpina Condensed';
  display: inline;
  height: 16px;
  font-style: normal;
  font-weight: 300;
  font-size: 14.4127px;
  line-height: 16px;
  color: inherit;
`;

const LogoContainer = styled(HStack)`
  cursor: pointer;
`;

const UsernameText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 21px;
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 10px !important;
`;

const DropdownItem = styled.div`
  padding: 8px;

  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  color: #808080;
  cursor: pointer;

  white-space: nowrap;
`;

const DropdownProfileSection = styled(VStack)`
  padding: 8px;
`;

const Wrapper = styled(HStack)`
  position: relative;
`;

const DropdownContainer = styled(VStack)<{ active: boolean }>`
  position: absolute;
  z-index: 10;
  top: 100%;

  border: 1px solid ${colors.offBlack};
  padding: 4px;

  > *:not(:last-child) {
    border-bottom: 1px solid ${colors.faint};
  }

  transition: transform 250ms ease-out, opacity 250ms linear;

  ${({ active }) =>
    active
      ? css`
          transform: translateY(8px);
          opacity: 1;
        `
      : css`
          transform: translateY(4px);
          pointer-events: none;
          opacity: 0;
        `}
`;

const NotificationsCircle = styled.div`
  width: 4px;
  height: 4px;
  background-color: ${colors.hyperBlue};
  border-radius: 99999px;
`;

const SlashText = styled(Paragraph)`
  font-family: ${TITLE_FONT_FAMILY};
  font-size: 18px;
  font-weight: 300;
  line-height: 21px;
`;

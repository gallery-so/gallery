import colors from 'components/core/colors';
import { BaseS, Paragraph, TITLE_FONT_FAMILY, TitleM } from 'components/core/Text/Text';
import { HStack, VStack } from 'components/core/Spacer/Stack';
import InteractiveLink from 'components/core/InteractiveLink/InteractiveLink';
import styled, { css } from 'styled-components';
import Link from 'next/link';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { DropdownFragment$key } from '../../../../../__generated__/DropdownFragment.graphql';
import { MouseEventHandler, ReactNode, useCallback } from 'react';

type Props = {
  showDropdown: boolean;
  onClose: () => void;
  queryRef: DropdownFragment$key;
};

export function Dropdown({ showDropdown, onClose, queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment DropdownFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }

            viewerGalleries {
              gallery {
                dbid
              }
            }
          }
        }
      }
    `,
    queryRef
  );

  const { handleLogout } = useAuthActions();

  const handleClose = useCallback<MouseEventHandler>(
    (event) => {
      event.stopPropagation();

      onClose();
    },
    [onClose]
  );

  const firstGalleryId = query.viewer?.viewerGalleries?.[0]?.gallery?.dbid;
  const editGalleryUrl = firstGalleryId ? `/gallery/${firstGalleryId}/edit` : null;

  return (
    <>
      {/* Used to hijack click events on things outside of the dropdown */}

      {showDropdown && <Backdrop onClick={handleClose} />}

      <DropdownContainer gap={8} active={showDropdown}>
        <DropdownProfileSection gap={4}>
          <HStack gap={4} align="center">
            <UsernameText>{query.viewer?.user?.username}</UsernameText>
            <BaseS>•</BaseS>
            <BaseS>Profile</BaseS>
          </HStack>
          {editGalleryUrl && (
            <StyledInteractiveLink to={editGalleryUrl}>Edit Gallery</StyledInteractiveLink>
          )}
        </DropdownProfileSection>

        <VStack gap={4}>
          <DropdownLink href={'/home'}>HOME</DropdownLink>
        </VStack>

        <VStack gap={4}>
          <DropdownLink href={'/accounts'}>ACCOUNTS</DropdownLink>
          <DropdownLink href={'/shop'}>
            <HStack gap={8}>
              <span>SHOP</span>
              <StyledObjectsText>(OBJECTS)</StyledObjectsText>
            </HStack>
          </DropdownLink>
        </VStack>

        <VStack gap={4}>
          <DropdownItem onClick={handleLogout}>LOG OUT</DropdownItem>
        </VStack>
      </DropdownContainer>
    </>
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
  padding: 8px;

  font-family: 'Helvetica Neue';
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  color: #808080;
  cursor: pointer;
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

const DropdownContainer = styled(VStack)<{ active: boolean }>`
  position: absolute;
  z-index: 10;
  top: 100%;

  background-color: ${colors.white};

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

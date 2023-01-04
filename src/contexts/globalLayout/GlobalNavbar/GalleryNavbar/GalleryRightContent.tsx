import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';
import { Button } from '~/components/core/Button/Button';

import colors from '~/components/core/colors';
import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import useCreateGallery from '~/components/MultiGallery/useCreateGallery';
import { EditLink } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryRightContentFragment$key } from '~/generated/GalleryRightContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { useQrCode } from '~/scenes/Modals/QRCodePopover';
import EditUserInfoModal from '~/scenes/UserGalleryPage/EditUserInfoModal';
import LinkButton from '~/scenes/UserGalleryPage/LinkButton';
import { getEditGalleryUrl } from '~/utils/getEditGalleryUrl';

import QRCodeButton from './QRCodeButton';

type GalleryRightContentProps = {
  username: string;
  queryRef: GalleryRightContentFragment$key;
};

export function GalleryRightContent({ queryRef, username }: GalleryRightContentProps) {
  const query = useFragment(
    graphql`
      fragment GalleryRightContentFragment on Query {
        ...EditUserInfoModalFragment
        ...getEditGalleryUrlFragment

        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }

        userByUsername(username: $username) {
          ... on GalleryUser {
            dbid
          }
        }
      }
    `,
    queryRef
  );

  const styledQrCode = useQrCode();
  const { showModal } = useModalActions();

  const createGallery = useCreateGallery();

  const handleCreateGallery = useCallback(() => {
    createGallery();
  }, [createGallery]);

  const handleNameAndBioClick = useCallback(() => {
    showModal({
      content: <EditUserInfoModal queryRef={query} />,
      headerText: 'Edit username and bio',
    });
  }, [query, showModal]);

  const shouldShowEditButton = Boolean(
    query.viewer &&
      'user' in query.viewer &&
      query.viewer?.user?.dbid &&
      query.viewer?.user?.dbid === query.userByUsername?.dbid
  );

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleEditClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const editGalleryUrl = getEditGalleryUrl(query);

  const dropdown = useMemo(() => {
    return (
      <Dropdown active={showDropdown} onClose={handleCloseDropdown} position="right">
        <DropdownSection>
          {editGalleryUrl && <DropdownLink href={editGalleryUrl}>EDIT GALLERY</DropdownLink>}
          <DropdownItem onClick={handleNameAndBioClick}>NAME & BIO</DropdownItem>
        </DropdownSection>
      </Dropdown>
    );
  }, [editGalleryUrl, handleCloseDropdown, handleNameAndBioClick, showDropdown]);

  if (isMobile) {
    return (
      <HStack gap={8} align="center">
        <QRCodeButton username={username} styledQrCode={styledQrCode} />
        <LinkButton textToCopy={`https://gallery.so/${username}`} />
        {shouldShowEditButton && (
          <EditLinkWrapper>
            <EditLink role="button" onClick={handleEditClick} />

            {dropdown}
          </EditLinkWrapper>
        )}
      </HStack>
    );
  }

  if (shouldShowEditButton) {
    return (
      <HStack gap={12}>
        {editGalleryUrl && (
          // <Link href={editGalleryUrl}>
          <Button variant="secondary" onClick={handleCreateGallery}>
            Add New
          </Button>
          // </Link>
        )}
        <Button>DONE</Button>
      </HStack>
    );
  } else if (query.viewer?.__typename !== 'Viewer') {
    return <SignInButton />;
  }

  return null;
}

const EditLinkWrapper = styled.div`
  position: relative;
`;

const EditButtonContainer = styled.div.attrs({ role: 'button' })`
  position: relative;

  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;

  :hover {
    background-color: ${colors.faint};
  }
`;

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GalleryRightContentFragment$key } from '__generated__/GalleryRightContentFragment.graphql';
import styled from 'styled-components';
import { TitleXS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { useCallback, useMemo, useState } from 'react';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { HStack } from 'components/core/Spacer/Stack';
import { EditLink } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import LinkButton from 'scenes/UserGalleryPage/LinkButton';
import { useQrCode } from 'scenes/Modals/QRCodePopover';
import QRCodeButton from './QRCodeButton';
import { useModalActions } from 'contexts/modal/ModalContext';
import EditUserInfoModal from 'scenes/UserGalleryPage/EditUserInfoModal';
import { SignInButton } from 'contexts/globalLayout/GlobalNavbar/SignInButton';
import { Dropdown } from 'components/core/Dropdown/Dropdown';
import { DropdownSection } from 'components/core/Dropdown/DropdownSection';
import { DropdownItem } from 'components/core/Dropdown/DropdownItem';
import { DropdownLink } from 'components/core/Dropdown/DropdownLink';
import { getEditGalleryUrl } from 'utils/getEditGalleryUrl';

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
      <EditButtonContainer onClick={handleEditClick}>
        <TitleXS>EDIT</TitleXS>

        {dropdown}
      </EditButtonContainer>
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

import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import colors from '~/components/core/colors';
import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import { EditLink } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CollectionRightContentFragment$key } from '~/generated/CollectionRightContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import EditUserInfoModal from '~/scenes/UserGalleryPage/EditUserInfoModal';
import LinkButton from '~/scenes/UserGalleryPage/LinkButton';

type CollectionRightContentProps = {
  username: string;
  collectionId: string;
  queryRef: CollectionRightContentFragment$key;
};

export function CollectionRightContent({
  queryRef,
  username,
  collectionId,
}: CollectionRightContentProps) {
  const query = useFragment(
    graphql`
      fragment CollectionRightContentFragment on Query {
        userByUsername(username: $username) {
          ... on GalleryUser {
            dbid
          }
        }

        viewer {
          ... on Viewer {
            __typename
            user {
              dbid
            }
          }
        }

        collectionById(id: $collectionId) {
          ... on Collection {
            gallery {
              dbid
            }
          }
        }

        ...EditUserInfoModalFragment
      }
    `,
    queryRef
  );

  const shouldShowEditButton = useMemo(() => {
    // If the user isn't logged in, we shouldn't show an edit button
    if (query.viewer?.__typename !== 'Viewer') {
      return false;
    }

    // If the current gallery's user is not the logged in user
    // we should not show the edit button either
    if (query.viewer.user?.dbid !== query.userByUsername?.dbid) {
      return false;
    }

    return true;
  }, [query]);

  const [showDropdown, setShowDropdown] = useState(false);

  const { showModal } = useModalActions();
  const isMobile = useIsMobileOrMobileLargeWindowWidth();

  const handleEditClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const handleNameAndBioClick = useCallback(() => {
    showModal({
      content: <EditUserInfoModal queryRef={query} />,
      headerText: 'Edit username and bio',
    });
  }, [query, showModal]);

  const editCollectionUrl: Route | null = useMemo(() => {
    const galleryId = query.collectionById?.gallery?.dbid;

    if (galleryId) {
      return {
        pathname: '/gallery/[galleryId]/collection/[collectionId]/edit',
        query: { collectionId, galleryId },
      };
    }

    return null;
  }, [collectionId, query.collectionById?.gallery?.dbid]);

  const dropdown = useMemo(() => {
    return (
      <Dropdown active={showDropdown} onClose={handleCloseDropdown} position="right">
        <DropdownSection>
          {editCollectionUrl && (
            <DropdownLink href={editCollectionUrl}>EDIT COLLECTION</DropdownLink>
          )}
          <DropdownItem onClick={handleNameAndBioClick}>NAME & BIO</DropdownItem>
        </DropdownSection>
      </Dropdown>
    );
  }, [editCollectionUrl, handleCloseDropdown, handleNameAndBioClick, showDropdown]);

  if (isMobile) {
    return (
      <HStack gap={8} align="center">
        <LinkButton textToCopy={`https://gallery.so/${username}/${collectionId}`} />
        {shouldShowEditButton && (
          <EditLinkWrapper>
            <EditLink onClick={handleEditClick} />

            {dropdown}
          </EditLinkWrapper>
        )}
      </HStack>
    );
  } else if (shouldShowEditButton) {
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

const EditButtonContainer = styled.div`
  position: relative;

  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;

  cursor: pointer;

  :hover {
    background-color: ${colors.faint};
  }
`;

import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { CollectionRightContentFragment$key } from '__generated__/CollectionRightContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from 'hooks/useWindowSize';
import { useCallback, useMemo, useState } from 'react';
import { HStack } from 'components/core/Spacer/Stack';
import { EditLink } from 'contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import styled from 'styled-components';
import LinkButton from 'scenes/UserGalleryPage/LinkButton';
import Link from 'next/link';
import { TitleXS } from 'components/core/Text/Text';
import colors from 'components/core/colors';
import { Route, route } from 'nextjs-routes';
import { SignInButton } from 'contexts/globalLayout/GlobalNavbar/SignInButton';
import { Dropdown } from 'components/core/Dropdown/Dropdown';
import { DropdownSection } from 'components/core/Dropdown/DropdownSection';
import { DropdownLink } from 'components/core/Dropdown/DropdownLink';
import { DropdownItem } from 'components/core/Dropdown/DropdownItem';
import EditUserInfoModal from 'scenes/UserGalleryPage/EditUserInfoModal';
import { useModalActions } from 'contexts/modal/ModalContext';

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

  if (isMobile) {
    return (
      <HStack gap={8} align="center">
        <LinkButton textToCopy={`https://gallery.so/${username}/${collectionId}`} />
        {shouldShowEditButton && editCollectionUrl && (
          <Link href={editCollectionUrl}>
            <a href={route(editCollectionUrl)}>
              <EditLink />
            </a>
          </Link>
        )}
      </HStack>
    );
  } else if (shouldShowEditButton) {
    return (
      <EditButtonContainer onClick={handleEditClick}>
        <TitleXS>EDIT</TitleXS>

        <Dropdown active={showDropdown} onClose={handleCloseDropdown} position="right">
          <DropdownSection>
            {editCollectionUrl && (
              <DropdownLink href={editCollectionUrl}>EDIT COLLECTION</DropdownLink>
            )}
            <DropdownItem onClick={handleNameAndBioClick}>NAME & BIO</DropdownItem>
          </DropdownSection>
        </Dropdown>
      </EditButtonContainer>
    );
  } else if (query.viewer?.__typename !== 'Viewer') {
    return <SignInButton />;
  }

  return null;
}

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

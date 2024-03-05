import { Route } from 'nextjs-routes';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import { HStack } from '~/components/core/Spacer/Stack';
import FollowButton from '~/components/Follow/FollowButton';
import { AuthButton } from '~/contexts/globalLayout/GlobalNavbar/AuthButton';
import { EditLink } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { CollectionRightContentFragment$key } from '~/generated/CollectionRightContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import EditUserInfoModal from '~/scenes/UserGalleryPage/EditUserInfoModal';
import LinkButton from '~/scenes/UserGalleryPage/LinkButton';
import { contexts } from '~/shared/analytics/constants';

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
            ...FollowButtonUserFragment
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
        ...FollowButtonQueryFragment
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
        pathname: '/gallery/[galleryId]/edit',
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
            <DropdownLink
              href={editCollectionUrl}
              name="Collection Nav"
              eventContext={contexts.UserCollection}
              label="Edit Section"
            />
          )}
          <DropdownItem
            onClick={handleNameAndBioClick}
            name="Collection Nav"
            eventContext={contexts.UserCollection}
            label="Name & Bio"
          />
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
        {query.userByUsername && (
          <Suspense fallback={null}>
            <FollowButton queryRef={query} userRef={query.userByUsername} source="navbar mobile" />
          </Suspense>
        )}
      </HStack>
    );
  } else if (query.viewer?.__typename !== 'Viewer') {
    return (
      <HStack gap={8} align="center">
        <AuthButton buttonLocation="Gallery Collection View Navbar" />
      </HStack>
    );
  }

  return null;
}

const EditLinkWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

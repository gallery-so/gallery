import Link from 'next/link';
import { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import useCreateGallery from '~/components/MultiGallery/useCreateGallery';
import { EditLink } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { GalleryRightContentFragment$key } from '~/generated/GalleryRightContentFragment.graphql';
import { GalleryRightContentGalleryFragment$key } from '~/generated/GalleryRightContentGalleryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import EditUserInfoModal from '~/scenes/UserGalleryPage/EditUserInfoModal';
import LinkButton from '~/scenes/UserGalleryPage/LinkButton';
import colors from '~/shared/theme/colors';

import { SignUpButton } from '../SignUpButton';
import QRCodeButton from './QRCodeButton';

type GalleryRightContentProps = {
  username: string;
  galleryRef: GalleryRightContentGalleryFragment$key | null;
  queryRef: GalleryRightContentFragment$key;
};

export function GalleryRightContent({ queryRef, galleryRef, username }: GalleryRightContentProps) {
  const query = useFragment(
    graphql`
      fragment GalleryRightContentFragment on Query {
        ...EditUserInfoModalFragment

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
            galleries {
              __typename
            }
          }
        }
      }
    `,
    queryRef
  );

  const gallery = useFragment(
    graphql`
      fragment GalleryRightContentGalleryFragment on Gallery {
        dbid
      }
    `,
    galleryRef
  );

  const { showModal } = useModalActions();
  const { route } = useRouter();
  const { pushToast } = useToastActions();

  const createGallery = useCreateGallery();

  const handleCreateGallery = useCallback(async () => {
    const latestPosition = query?.userByUsername?.galleries?.length.toString() ?? '0';

    try {
      await createGallery(latestPosition);
    } catch (error) {
      if (error instanceof Error) {
        pushToast({
          message: 'Unfortunately there was an error to create your gallery',
        });
      }
    }
  }, [createGallery, pushToast, query?.userByUsername?.galleries?.length]);

  const handleNameAndBioClick = useCallback(() => {
    showModal({
      content: <EditUserInfoModal queryRef={query} />,
      headerText: 'Edit username and bio',
    });
  }, [query, showModal]);

  const shouldShowEditButton = useMemo(() => {
    return Boolean(
      query.viewer &&
        'user' in query.viewer &&
        query.viewer?.user?.dbid &&
        query.viewer?.user?.dbid === query.userByUsername?.dbid
    );
  }, [query.viewer, query.userByUsername?.dbid]);

  const showShowMultiGalleryButton = useMemo(() => {
    return Boolean(
      query.viewer &&
        'user' in query.viewer &&
        query.viewer?.user?.dbid &&
        query.viewer?.user?.dbid === query.userByUsername?.dbid &&
        route === '/[username]/galleries'
    );
  }, [query.userByUsername?.dbid, query.viewer, route]);

  const isMobile = useIsMobileOrMobileLargeWindowWidth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleEditClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const editGalleryUrl: Route | null = useMemo(() => {
    if (!gallery?.dbid) {
      return null;
    }

    return {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId: gallery.dbid },
    };
  }, [gallery?.dbid]);

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
        <QRCodeButton username={username} />
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

  if (showShowMultiGalleryButton) {
    return (
      <VStack align="center">
        <Button variant="primary" onClick={handleCreateGallery}>
          Add New
        </Button>
      </VStack>
    );
  }

  if (shouldShowEditButton) {
    return (
      <HStack gap={12}>
        {shouldShowEditButton && editGalleryUrl && (
          <EditButtonContainer>
            <Link href={editGalleryUrl} legacyBehavior>
              <TitleXS>EDIT</TitleXS>
            </Link>
          </EditButtonContainer>
        )}
      </HStack>
    );
  } else if (query.viewer?.__typename !== 'Viewer') {
    return (
      <HStack gap={8} align="center">
        <SignInButton />
        {/* Don't show Sign Up btn on mobile bc it doesnt fit alongside Sign In, and onboarding isn't mobile optimized yet */}
        {!isMobile && <SignUpButton />}
      </HStack>
    );
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

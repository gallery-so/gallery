import router, { useRouter } from 'next/router';
import { Route } from 'nextjs-routes';
import { Suspense, useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import FollowButton from '~/components/Follow/FollowButton';
import Settings from '~/components/Settings/Settings';
import { AuthButton } from '~/contexts/globalLayout/GlobalNavbar/AuthButton';
import { EditLink } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { GalleryRightContentFragment$key } from '~/generated/GalleryRightContentFragment.graphql';
import { GalleryRightContentGalleryFragment$key } from '~/generated/GalleryRightContentGalleryFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import CogIcon from '~/icons/CogIcon';
import EditUserInfoModal from '~/scenes/UserGalleryPage/EditUserInfoModal';
import LinkButton from '~/scenes/UserGalleryPage/LinkButton';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import useCreateGallery from '~/shared/hooks/useCreateGallery';

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
        ...FollowButtonQueryFragment

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
            featuredGallery {
              dbid
            }
            ...FollowButtonUserFragment
          }
        }

        ...SettingsFragment
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
      await createGallery(latestPosition, (galleryId) => {
        const route = {
          pathname: '/gallery/[galleryId]/edit',
          query: { galleryId },
        };
        router.push(route);
      });
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

  const isViewingSignedInUser = useMemo(() => {
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

  const track = useTrack();

  const handleEditClick = useCallback(() => {
    setShowDropdown((previous) => !previous);
  }, []);

  const handleCloseDropdown = useCallback(() => {
    setShowDropdown(false);
  }, []);

  const handleSettingsClick = useCallback(() => {
    track('Sidebar Settings Click');
    showModal({
      content: <Settings queryRef={query} />,
      headerText: 'Settings',
      isFullPage: true,
    });
  }, [query, showModal, track]);

  const handleEditGalleryClick = useCallback(() => {
    const routeGalleryId = router.query.galleryId as string;
    // The Edit button appears on each Gallery page as well as the Featured Gallery page, so if there's a galleryId in the route, use that
    const editGalleryId = routeGalleryId ?? query.userByUsername?.featuredGallery?.dbid;

    const route = {
      pathname: '/gallery/[galleryId]/edit',
      query: { galleryId: editGalleryId },
    };
    router.push(route);
  }, [query.userByUsername?.featuredGallery?.dbid]);

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
          {editGalleryUrl && (
            <DropdownLink
              href={editGalleryUrl}
              name="Gallery Nav"
              eventContext={contexts.UserGallery}
              label="Edit Gallery"
            />
          )}
          <DropdownItem
            onClick={handleNameAndBioClick}
            name="Gallery Nav"
            eventContext={contexts.UserGallery}
            label="Name & Bio"
          />
        </DropdownSection>
      </Dropdown>
    );
  }, [editGalleryUrl, handleCloseDropdown, handleNameAndBioClick, showDropdown]);

  if (isMobile) {
    return (
      <HStack gap={8} align="center">
        <QRCodeButton username={username} />
        <LinkButton textToCopy={`https://gallery.so/${username}`} />
        {isViewingSignedInUser && (
          <EditLinkWrapper>
            <EditLink role="button" onClick={handleEditClick} />

            {dropdown}
          </EditLinkWrapper>
        )}
        {query.userByUsername && (
          <Suspense fallback={null}>
            <FollowButton queryRef={query} userRef={query.userByUsername} source="navbar mobile" />
          </Suspense>
        )}
        {isViewingSignedInUser && (
          <IconContainer onClick={handleSettingsClick} variant="default" icon={<CogIcon />} />
        )}
      </HStack>
    );
  }

  if (showShowMultiGalleryButton) {
    return (
      <VStack align="center">
        <Button
          eventElementId="Add New Gallery Button"
          eventName="Add New Gallery"
          eventContext={contexts.Editor}
          variant="primary"
          onClick={handleCreateGallery}
        >
          Add New
        </Button>
      </VStack>
    );
  }

  if (isViewingSignedInUser) {
    return (
      <Button
        eventElementId="Edit Gallery Button In Navbar"
        eventName="Clicked Edit Gallery Button In Navbar"
        eventContext={contexts.Editor}
        variant="primary"
        onClick={handleEditGalleryClick}
      >
        Edit
      </Button>
    );
  }

  if (query.viewer?.__typename !== 'Viewer') {
    return (
      <HStack gap={8} align="center">
        <AuthButton buttonLocation="Gallery Navbar" />
      </HStack>
    );
  }

  return null;
}

const EditLinkWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

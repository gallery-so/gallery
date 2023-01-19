import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { Button } from '~/components/core/Button/Button';
import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import { HStack } from '~/components/core/Spacer/Stack';
import useCreateGallery from '~/components/MultiGallery/useCreateGallery';
import Tooltip from '~/components/Tooltip/Tooltip';
import { EditLink } from '~/contexts/globalLayout/GlobalNavbar/CollectionNavbar/EditLink';
import { SignInButton } from '~/contexts/globalLayout/GlobalNavbar/SignInButton';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { GalleryRightContentFragment$key } from '~/generated/GalleryRightContentFragment.graphql';
import { useIsMobileOrMobileLargeWindowWidth } from '~/hooks/useWindowSize';
import { useQrCode } from '~/scenes/Modals/QRCodePopover';
import EditUserInfoModal from '~/scenes/UserGalleryPage/EditUserInfoModal';
import LinkButton from '~/scenes/UserGalleryPage/LinkButton';
import { getEditGalleryUrl } from '~/utils/getEditGalleryUrl';
import isFeatureEnabled, { FeatureFlag } from '~/utils/graphql/isFeatureEnabled';

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
        ...isFeatureEnabledFragment

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

  const styledQrCode = useQrCode();
  const { showModal } = useModalActions();
  const { route } = useRouter();

  const isMultigalleryEnabled = isFeatureEnabled(FeatureFlag.MULTIGALLERY, query);
  const [showTooltip, setShowTooltip] = useState(false);

  console.log('isMultigalleryEnabled', isMultigalleryEnabled);

  const createGallery = useCreateGallery();

  const handleCreateGallery = useCallback(() => {
    const latestPosition = query?.userByUsername?.galleries?.length.toString() ?? '0';

    createGallery(latestPosition);
  }, [createGallery, query?.userByUsername?.galleries?.length]);

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

  const showShowMultiGalleryButton = Boolean(
    query.viewer &&
      'user' in query.viewer &&
      query.viewer?.user?.dbid &&
      query.viewer?.user?.dbid === query.userByUsername?.dbid &&
      route === '/[username]/galleries'
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

  if (showShowMultiGalleryButton) {
    return (
      <HStack gap={12}>
        {editGalleryUrl && (
          <div onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
            {!isMultigalleryEnabled && (
              <StyledTooltip text={'Coming Soon'} showTooltip={showTooltip} />
            )}
            <Button
              variant="secondary"
              onClick={handleCreateGallery}
              disabled={!isMultigalleryEnabled}
            >
              Add New
            </Button>
          </div>
        )}
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

const StyledTooltip = styled(Tooltip)<{ showTooltip: boolean }>`
  opacity: ${({ showTooltip }) => (showTooltip ? 1 : 0)};
  transform: translateX(${({ showTooltip }) => (showTooltip ? '-120%' : '-90%')});
  top: 16px;
`;

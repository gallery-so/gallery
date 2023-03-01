import Link from 'next/link';
import { Route, route } from 'nextjs-routes';
import { useCallback } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled, { css } from 'styled-components';

import breakpoints from '~/components/core/breakpoints';
import colors from '~/components/core/colors';
import { Dropdown } from '~/components/core/Dropdown/Dropdown';
import { DropdownItem } from '~/components/core/Dropdown/DropdownItem';
import { DropdownLink } from '~/components/core/Dropdown/DropdownLink';
import { DropdownSection } from '~/components/core/Dropdown/DropdownSection';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { BaseM, Paragraph, TITLE_FONT_FAMILY, TitleM } from '~/components/core/Text/Text';
import useNotificationsModal from '~/components/NotificationsModal/useNotificationsModal';
import { useSubscribeToNotifications } from '~/components/NotificationsModal/useSubscribeToNotifications';
import { useTrack } from '~/contexts/analytics/AnalyticsContext';
import { useAuthActions } from '~/contexts/auth/AuthContext';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { ProfileDropdownContentFragment$key } from '~/generated/ProfileDropdownContentFragment.graphql';
import SettingsModal from '~/scenes/Modals/SettingsModal/SettingsModal';
import useExperience from '~/utils/graphql/experiences/useExperience';

type Props = {
  shouldShowDropdown: boolean;
  onClose: () => void;
  onMouseLeave: () => void;
  onMouseEnter: () => void;
  queryRef: ProfileDropdownContentFragment$key;
};

export function ProfileDropdownContent({
  onClose,
  queryRef,
  onMouseLeave,
  onMouseEnter,
  shouldShowDropdown,
}: Props) {
  useSubscribeToNotifications();

  const query = useFragment(
    graphql`
      fragment ProfileDropdownContentFragment on Query {
        viewer {
          ... on Viewer {
            user {
              username
            }

            notifications(last: 1)
              @connection(key: "ProfileDropdownContentFragment_notifications") {
              unseenCount
              # Relay requires that we grab the edges field if we use the connection directive
              # We're selecting __typename since that shouldn't have a cost
              # eslint-disable-next-line relay/unused-fields
              edges {
                __typename
              }
            }
          }
        }

        ...SettingsModalFragment

        ...useExperienceFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();
  const { handleLogout } = useAuthActions();
  const showNotificationsModal = useNotificationsModal();

  const track = useTrack();

  const [isMerchStoreUpsellExperienced, setMerchStoreUpsellExperienced] = useExperience({
    type: 'MerchStoreUpsell',
    queryRef: query,
  });

  const handleDismissMerchRedemption = useCallback(async () => {
    await setMerchStoreUpsellExperienced();
  }, [setMerchStoreUpsellExperienced]);

  const handleNotificationsClick = useCallback(() => {
    track('Open Notifications Click');
    showNotificationsModal();
  }, [showNotificationsModal, track]);

  const handleManageWalletsClick = useCallback(() => {
    showModal({
      content: <SettingsModal queryRef={query} />,
      headerText: 'Settings',
    });
  }, [query, showModal]);

  const username = query.viewer?.user?.username;

  if (!username) {
    return null;
  }

  const userGalleryRoute: Route = { pathname: '/[username]', query: { username } };
  const editGalleriesRoute: Route = { pathname: '/[username]/galleries', query: { username } };

  const notificationCount = query.viewer?.notifications?.unseenCount ?? 0;

  return (
    <Dropdown
      isActivatedByHover
      position="left"
      active={shouldShowDropdown}
      onClose={onClose}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <DropdownSection>
        <Link href={userGalleryRoute} legacyBehavior>
          <DropdownProfileSection href={route(userGalleryRoute)}>
            <UsernameText>{username}</UsernameText>
            <VStack align="flex-start">
              <StyledInteractiveLink to={editGalleriesRoute}>Edit galleries</StyledInteractiveLink>
            </VStack>
          </DropdownProfileSection>
        </Link>
      </DropdownSection>

      <DropdownSection gap={4}>
        <DropdownLink href={{ pathname: '/trending' }}>HOME</DropdownLink>
        <NotificationsDropdownItem onClick={handleNotificationsClick}>
          <HStack align="center" gap={10}>
            <div>NOTIFICATIONS</div>
            <CountText role="button" visible={notificationCount > 0}>
              {notificationCount}
            </CountText>
          </HStack>
        </NotificationsDropdownItem>
      </DropdownSection>

      <DropdownSection gap={4}>
        <DropdownItem onClick={handleManageWalletsClick}>SETTINGS</DropdownItem>
        <DropdownLink href={{ pathname: '/shop' }} onClick={handleDismissMerchRedemption}>
          <HStack gap={10} align="center">
            <HStack gap={8}>
              <span>SHOP</span>
              <StyledObjectsText>(OBJECTS)</StyledObjectsText>
            </HStack>
            {!isMerchStoreUpsellExperienced && <NotificationsCircle />}
          </HStack>
        </DropdownLink>
      </DropdownSection>

      <DropdownSection gap={4}>
        <DropdownItem onClick={handleLogout}>LOG OUT</DropdownItem>
      </DropdownSection>
    </Dropdown>
  );
}

const CountText = styled(BaseM)<{ visible: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;

  padding: 4px 6px;
  font-variant-numeric: tabular-nums;

  font-size: 12px;

  color: ${colors.white};
  background-color: ${colors.hyperBlue};

  font-variant-numeric: tabular-nums;
  line-height: 1;

  user-select: none;

  border-radius: 99999px;

  transition: opacity 150ms ease-in-out;

  ${({ visible }) =>
    visible
      ? css`
          opacity: 1;
        `
      : css`
          opacity: 0;
        `}
`;

const NotificationsDropdownItem = styled(DropdownItem)``;

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
  line-height: 21px;
  letter-spacing: -0.04em;

  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;

  font-size: 16px;
  @media only screen and ${breakpoints.tablet} {
    font-size: 18px;
  }
`;

const StyledInteractiveLink = styled(InteractiveLink)`
  font-size: 12px !important;
`;

const DropdownProfileSection = styled.a`
  display: flex;
  flex-direction: column;
  gap: 4px 0;

  text-decoration: none;

  padding: 8px;

  :hover {
    background-color: ${colors.faint};
  }
`;

const NotificationsCircle = styled.div`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  background-color: ${colors.hyperBlue};
`;

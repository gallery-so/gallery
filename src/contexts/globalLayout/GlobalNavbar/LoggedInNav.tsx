import { useCallback } from 'react';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';
import { useModalActions } from 'contexts/modal/ModalContext';
import EditUserInfoModal from 'scenes/UserGalleryPage/EditUserInfoModal';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import NavElement from './NavElement';
import { useRouter } from 'next/router';
import { graphql, useFragment } from 'react-relay';
import { LoggedInNavFragment$key } from '__generated__/LoggedInNavFragment.graphql';
import styled from 'styled-components';
import colors from 'components/core/colors';
import { useAuthActions } from 'contexts/auth/AuthContext';
import { UnstyledLink } from 'components/core/Link/UnstyledLink';
import { TitleM } from 'components/core/Text/Text';
import LogoBracketLeft from 'icons/LogoBracketLeft';
import LogoBracketRight from 'icons/LogoBracketRight';
import { HStack } from 'components/core/Spacer/Stack';

type Props = {
  queryRef: LoggedInNavFragment$key;
};

function LoggedInNav({ queryRef }: Props) {
  const { showModal } = useModalActions();

  const query = useFragment(
    graphql`
      fragment LoggedInNavFragment on Query {
        ...EditUserInfoModalFragment
        ...ManageWalletsModalFragment
        ...isFeatureEnabledFragment

        viewer {
          ... on Viewer {
            __typename
            user {
              username
            }
          }
        }
      }
    `,
    queryRef
  );

  const { query: routerQuery } = useRouter();

  const handleManageWalletsClick = useCallback(() => {
    showModal({ content: <ManageWalletsModal queryRef={query} />, headerText: 'Manage accounts' });
  }, [query, showModal]);

  const handleEditNameClick = useCallback(() => {
    showModal({
      content: <EditUserInfoModal queryRef={query} />,
      headerText: 'Edit username and bio',
    });
  }, [query, showModal]);

  const { handleLogout } = useAuthActions();
  const handleSignOutClick = useCallback(() => {
    void handleLogout();
  }, [handleLogout]);

  // TODO: we shouldn't need to do this, since the parent should verify that
  // `viewer` exists. however, the logout action that dismounts client:root:viewer
  // causes this component to freak out before the parent realizes it shouldn't
  // be rendering this child... need to figure out best practices here
  if (!query || query.viewer?.__typename !== 'Viewer') {
    return null;
  }

  const username = query.viewer.user?.username;
  const userOwnsCollectionOrGallery = routerQuery?.username === username;

  return (
    <HStack gap={24}>
      {userOwnsCollectionOrGallery && (
        <NavElement>
          <Dropdown mainText="Edit" shouldCloseOnMenuItemClick>
            <UnstyledLink
              href={
                routerQuery.collectionId
                  ? `/edit?collectionId=${routerQuery.collectionId}`
                  : '/edit'
              }
            >
              <TextButton text={routerQuery.collectionId ? 'Edit Collection' : 'Edit Gallery'} />
            </UnstyledLink>
            <TextButton text="Name & Bio" onClick={handleEditNameClick} />
          </Dropdown>
        </NavElement>
      )}
      <NavElement>
        <StyledDropdownWrapper hasNotification={false}>
          <Dropdown mainText={username || 'ACCOUNT'} shouldCloseOnMenuItemClick>
            <UnstyledLink href={`/${username}`}>
              <TextButton text="My Gallery" />
            </UnstyledLink>
            <TextButton text="Manage Accounts" onClick={handleManageWalletsClick} />
            <UnstyledLink href="/shop">
              <ShopOptionContainer>
                <StyledShopTextButton text="shop" />
                <StyledObjectsContainer>
                  <StyledLogoBracketLeft color={colors.shadow} />
                  <HStack gap={1}>
                    <StyledShopText>OBJECTS</StyledShopText>
                    <StyledLogoBracketRight color={colors.shadow} />
                  </HStack>
                </StyledObjectsContainer>
              </ShopOptionContainer>
            </UnstyledLink>
            <TextButton text="Sign out" onClick={handleSignOutClick} />
          </Dropdown>
        </StyledDropdownWrapper>
      </NavElement>
    </HStack>
  );
}

// Notification blue dot, to be used in the future
// const StyledCircle = styled.div`
//   height: 4px;
//   width: 4px;
//   background-color: ${colors.activeBlue};
//   margin-left: 4px;
//   border-radius: 50%;
// `;

const StyledDropdownWrapper = styled.div<{ hasNotification?: boolean }>`
  position: relative;

  ${({ hasNotification }) =>
    hasNotification &&
    `&:after {
      position: absolute;
      top: 5px;
      right: -10px;
      content: '';
      height: 4px;
      width: 4px;
      border-radius: 50%;
      background-color: ${colors.activeBlue};
  }`}
`;

const ShopOptionContainer = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.shadow};
`;

const StyledShopTextButton = styled(TextButton)`
  // override padding inherited from Dropdown
  padding-right: 4px !important;
`;

const StyledObjectsContainer = styled.div`
  height: 16px;
  display: flex;
  align-items: center;
`;

const StyledShopText = styled(TitleM)`
  font-family: 'GT Alpina Condensed';
  display: inline;
  height: 16px;
  font-style: normal;
  font-weight: 300;
  font-size: 14.4127px;
  line-height: 16px;
  color: inherit;
`;

const StyledLogoBracketLeft = styled(LogoBracketLeft)`
  width: 6px;
  height: 14px;
`;

const StyledLogoBracketRight = styled(LogoBracketRight)`
  width: 6px;
  height: 14px;
`;

export default LoggedInNav;

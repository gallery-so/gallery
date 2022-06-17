import { useCallback } from 'react';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';
import Spacer from 'components/core/Spacer/Spacer';
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

type Props = {
  queryRef: LoggedInNavFragment$key;
};

function LoggedInNav({ queryRef }: Props) {
  const { showModal } = useModalActions();
  const { push } = useRouter();

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
    showModal({ content: <ManageWalletsModal queryRef={query} /> });
  }, [query, showModal]);

  const handleEditNameClick = useCallback(() => {
    showModal({
      content: <EditUserInfoModal queryRef={query} />,
      headerText: 'Edit username and bio',
    });
  }, [query, showModal]);

  const handleEditDesignClick = useCallback(() => {
    if (routerQuery?.collectionId) {
      void push(`/edit?collectionId=${routerQuery.collectionId}`);
    } else {
      void push('/edit');
    }
  }, [push, routerQuery]);

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

  return username ? (
    <StyledLoggedInNav>
      {userOwnsCollectionOrGallery && (
        <NavElement>
          <Dropdown mainText="Edit" shouldCloseOnMenuItemClick>
            <TextButton
              text={routerQuery?.collectionId ? 'Collection Design' : 'Gallery Design'}
              onClick={handleEditDesignClick}
            />
            <Spacer height={12} />
            <TextButton text="Name & Bio" onClick={handleEditNameClick} />
          </Dropdown>
        </NavElement>
      )}
      <Spacer width={24} />
      <NavElement>
        <StyledDropdownWrapper>
          <Dropdown mainText={query.viewer.user.username} shouldCloseOnMenuItemClick>
            <TextButton text="My Gallery" onClick={() => push(`/${username}`)} />
            <Spacer height={12} />
            <TextButton text="Manage Accounts" onClick={handleManageWalletsClick} />
            <Spacer height={12} />
            <TextButton text="Sign out" onClick={handleSignOutClick} />
          </Dropdown>
        </StyledDropdownWrapper>
      </NavElement>
    </StyledLoggedInNav>
  ) : null;
}

const StyledLoggedInNav = styled.div`
  display: flex;
`;

// Notification blue dot, to be used in the future
// const StyledCircle = styled.div`
//   height: 4px;
//   width: 4px;
//   background-color: ${colors.activeBlue};
//   margin-left: 4px;
//   border-radius: 50%;
// `;

const StyledDropdownWrapper = styled.div<{ hasNotifiction?: boolean }>`
  position: relative;

  ${({ hasNotifiction }) =>
    hasNotifiction &&
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

export default LoggedInNav;

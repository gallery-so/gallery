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
import { isFeatureEnabled } from 'utils/featureFlag';
import { FeatureFlag } from 'components/core/enums';
import colors from 'components/core/colors';

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

  const handleManageWalletsClick = useCallback(() => {
    showModal({ content: <ManageWalletsModal queryRef={query} /> });
  }, [query, showModal]);

  const handleEditNameClick = useCallback(() => {
    showModal({ content: <EditUserInfoModal queryRef={query} /> });
  }, [query, showModal]);

  const handleEditGalleryClick = useCallback(() => {
    void push('/edit');
  }, [push]);

  const handleMintPostersClick = useCallback(() => {
    void push('/members/poster');
  }, [push]);

  // TODO: we shouldn't need to do this, since the parent should verify that
  // `viewer` exists. however, the logout action that dismounts client:root:viewer
  // causes this component to freak out before the parent realizes it shouldn't
  // be rendering this child... need to figure out best practices here
  if (!query || query.viewer?.__typename !== 'Viewer') {
    return null;
  }

  const username = query.viewer.user?.username;

  return username ? (
    <StyledLoggedInNav>
      <NavElement>
        <Dropdown mainText="Edit Profile" shouldCloseOnMenuItemClick>
          <TextButton text="Edit name & Bio" onClick={handleEditNameClick} />
          <Spacer height={12} />
          <TextButton text="Edit Gallery" onClick={handleEditGalleryClick} />
        </Dropdown>
      </NavElement>
      <Spacer width={24} />
      <NavElement>
        <Dropdown mainText={query.viewer.user.username} shouldCloseOnMenuItemClick>
          <TextButton text="My Gallery" onClick={() => push(`/${username}`)} />
          {isFeatureEnabled(FeatureFlag.POSTER_MINT) && (
            <>
              <Spacer height={12} />
              <StyledNavItemContainer>
                <TextButton text="MINT 2022 community POSTER" onClick={handleMintPostersClick} />
                <StyledCircle />
              </StyledNavItemContainer>
            </>
          )}
          <Spacer height={12} />
          <TextButton text="Manage Accounts" onClick={handleManageWalletsClick} />
        </Dropdown>
      </NavElement>
    </StyledLoggedInNav>
  ) : null;
}

const StyledLoggedInNav = styled.div`
  display: flex;
`;

const StyledNavItemContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledCircle = styled.div`
  height: 4px;
  width: 4px;
  background-color: ${colors.activeBlue};
  margin-left: 4px;
  border-radius: 50%;
`;

export default LoggedInNav;

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
import usePersistedState from 'hooks/usePersistedState';
import { GALLERY_POSTER_BANNER_STORAGE_KEY } from 'constants/storageKeys';

type Props = {
  queryRef: LoggedInNavFragment$key;
};

function LoggedInNav({ queryRef }: Props) {
  const { showModal } = useModalActions();
  const { push } = useRouter();
  const [isMintPosterDismissed, setMintPosterDismissed] = usePersistedState(
    GALLERY_POSTER_BANNER_STORAGE_KEY,
    false
  );

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
    setMintPosterDismissed(true);
    void push('/members/poster');
  }, [push, setMintPosterDismissed]);

  // TODO: we shouldn't need to do this, since the parent should verify that
  // `viewer` exists. however, the logout action that dismounts client:root:viewer
  // causes this component to freak out before the parent realizes it shouldn't
  // be rendering this child... need to figure out best practices here
  if (!query || query.viewer?.__typename !== 'Viewer') {
    return null;
  }

  const username = query.viewer.user?.username;

  const hasNotifiction = isFeatureEnabled(FeatureFlag.POSTER_MINT) && !isMintPosterDismissed;

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
        <StyledDropdownWrapper hasNotifiction={hasNotifiction}>
          <Dropdown mainText={query.viewer.user.username} shouldCloseOnMenuItemClick>
            <TextButton text="My Gallery" onClick={() => push(`/${username}`)} />
            {isFeatureEnabled(FeatureFlag.POSTER_MINT) && (
              <>
                <Spacer height={12} />
                <StyledNavItemContainer>
                  <TextButton text="MINT 2022 community POSTER" onClick={handleMintPostersClick} />
                  {!isMintPosterDismissed && <StyledCircle />}
                </StyledNavItemContainer>
              </>
            )}
            <Spacer height={12} />
            <TextButton text="Manage Accounts" onClick={handleManageWalletsClick} />
          </Dropdown>
        </StyledDropdownWrapper>
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

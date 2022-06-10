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
import { FeatureFlag } from 'components/core/enums';
import colors from 'components/core/colors';
import usePersistedState from 'hooks/usePersistedState';
import { GALLERY_POSTER_BANNER_STORAGE_KEY } from 'constants/storageKeys';
import isFeatureEnabled from 'utils/graphql/isFeatureEnabled';

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

  const username = query.viewer?.user?.username;

  const hasNotification =
    isFeatureEnabled(FeatureFlag.POSTER_MINT, query) && !isMintPosterDismissed;

  return (
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
        <StyledDropdownWrapper hasNotification={hasNotification}>
          {/* TODO: come up with a way for the user to finish setting up their gallery
                  if they happen to end up on their gallery page without setting their
                  username yet */}
          <Dropdown mainText={username || 'ACCOUNT'} shouldCloseOnMenuItemClick>
            <TextButton
              text="My Gallery"
              onClick={username ? () => push(`/${username}`) : undefined}
            />
            {isFeatureEnabled(FeatureFlag.POSTER_MINT, query) && (
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
  );
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

export default LoggedInNav;

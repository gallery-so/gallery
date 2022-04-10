import { useCallback } from 'react';
import TextButton from 'components/core/Button/TextButton';
import Dropdown from 'components/core/Dropdown/Dropdown';
import Spacer from 'components/core/Spacer/Spacer';
import { useModal } from 'contexts/modal/ModalContext';
import EditUserInfoModal from 'scenes/UserGalleryPage/EditUserInfoModal';
import ManageWalletsModal from 'scenes/Modals/ManageWalletsModal';
import NavElement from './NavElement';
import { useRouter } from 'next/router';
import { graphql, useFragment } from 'react-relay';
import { LoggedInNavFragment$key } from '__generated__/LoggedInNavFragment.graphql';

type Props = {
  queryRef: LoggedInNavFragment$key;
};

function LoggedInNav({ queryRef }: Props) {
  const { showModal } = useModal();
  const { push } = useRouter();

  const query = useFragment(
    graphql`
      fragment LoggedInNavFragment on Query {
        ...EditUserInfoModalFragment
        ...ManageWalletsModalFragment

        viewer @required(action: THROW) {
          ... on Viewer {
            __typename
            user @required(action: THROW) {
              username @required(action: THROW)
            }
          }
        }
      }
    `,
    queryRef
  );

  if (query.viewer.__typename !== 'Viewer') {
    throw new Error(
      `LoggedInNav expected Viewer to be type 'Viewer' but got: ${query.viewer.__typename}`
    );
  }

  const handleManageWalletsClick = useCallback(() => {
    showModal(<ManageWalletsModal queryRef={query} />);
  }, [query, showModal]);

  const handleEditNameClick = useCallback(() => {
    showModal(<EditUserInfoModal queryRef={query} />);
  }, [query, showModal]);

  const handleEditGalleryClick = useCallback(() => {
    void push('/edit');
  }, [push]);

  return (
    <>
      <NavElement>
        <Dropdown mainText="Edit Profile">
          <TextButton text="Edit name & Bio" onClick={handleEditNameClick} />
          <Spacer height={12} />
          <TextButton text="Edit Gallery" onClick={handleEditGalleryClick} />
        </Dropdown>
      </NavElement>
      <Spacer width={24} />
      <NavElement>
        <TextButton onClick={handleManageWalletsClick} text={query.viewer.user.username} />
      </NavElement>
    </>
  );
}

export default LoggedInNav;

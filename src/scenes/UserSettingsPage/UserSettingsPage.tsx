import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useModalActions } from '~/contexts/modal/ModalContext';
import { UserSettingsPageFragment$key } from '~/generated/UserSettingsPageFragment.graphql';

import ManageWalletsModal from '../Modals/ManageWalletsModal';
import UserGalleryPage from '../UserGalleryPage/UserGalleryPage';

type Props = {
  queryRef: UserSettingsPageFragment$key;
  username: string;
};

function UserSettingsPage({ queryRef, username }: Props) {
  const query = useFragment(
    graphql`
      fragment UserSettingsPageFragment on Query {
        ...UserGalleryPageFragment
        ...ManageWalletsModalFragment
      }
    `,
    queryRef
  );

  const { showModal } = useModalActions();
  const router = useRouter();

  const handleManageWalletsClick = useCallback(() => {
    showModal({
      content: <ManageWalletsModal queryRef={query} />,
      headerText: 'Manage accounts',
      onClose: () => {
        router.push({ pathname: '/[username]', query: { username } });
      },
    });
  }, [query, router, showModal, username]);

  const isShowModal = useRef(false);

  useEffect(() => {
    if (!isShowModal.current) {
      handleManageWalletsClick();
      isShowModal.current = true;
    }
  }, [handleManageWalletsClick]);

  return <UserGalleryPage username={username} queryRef={query} />;
}

export default UserSettingsPage;

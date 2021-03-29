import { memo, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import useAuthModal from 'hooks/useAuthModal';

function Auth(_: RouteComponentProps) {
  const displayAuthModal = useAuthModal();
  useEffect(() => {
    displayAuthModal();
    navigate('/');
    // We only want this to trigger once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default memo(Auth);

import { useCallback } from 'react';
import { navigate } from '@reach/router';
import TextButton from 'components/core/Button/TextButton';

function LoggedOutNav() {
  const handleAuthRedirect = useCallback(() => {
    navigate('/auth');
  }, []);

  return <TextButton onClick={handleAuthRedirect} text="Sign In" />;
}

export default LoggedOutNav;

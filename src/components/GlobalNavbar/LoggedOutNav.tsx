import TextButton from 'components/core/Button/TextButton';
import useAuthModal from 'hooks/useAuthModal';

function LoggedOutNav() {
  const showAuthModal = useAuthModal();

  return <TextButton onClick={showAuthModal} text="Sign In" />;
}

export default LoggedOutNav;

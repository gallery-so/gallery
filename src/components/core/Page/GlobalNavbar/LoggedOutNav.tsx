import TextButton from 'components/core/Button/TextButton';
import useAuthModal from 'hooks/useAuthModal';
import NavElement from './NavElement';

function LoggedOutNav() {
  const showAuthModal = useAuthModal();

  return (
    <NavElement>
      <TextButton onClick={showAuthModal} text="Sign In" />
    </NavElement>
  );
}

export default LoggedOutNav;

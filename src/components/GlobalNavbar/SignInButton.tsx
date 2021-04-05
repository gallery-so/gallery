import useAuthModal from 'hooks/useAuthModal';
import TextButton from 'components/core/Button/TextButton';

function SignInButton() {
  const displayAuthModal = useAuthModal();
  return <TextButton onClick={displayAuthModal} text="Sign In" />;
}

export default SignInButton;

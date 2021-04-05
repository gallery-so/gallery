import { useAuthActions } from 'contexts/auth/AuthContext';
import TextButton from 'components/core/Button/TextButton';

function SignOutButton() {
  const { logOut } = useAuthActions();
  return <TextButton onClick={logOut} text="Sign Out" />;
}

export default SignOutButton;

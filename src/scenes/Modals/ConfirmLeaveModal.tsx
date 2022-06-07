import useBackButton from 'hooks/useBackButton';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import GenericActionModal from './GenericActionModal';
import { ConfirmLeaveModalFragment$key } from '__generated__/ConfirmLeaveModalFragment.graphql';

// References the username to go back to the user's profile after user confirms
export function ConfirmLeaveModal({ userRef }: { userRef: ConfirmLeaveModalFragment$key }) {
  const user = useFragment(
    graphql`
      fragment ConfirmLeaveModalFragment on GalleryUser {
        username @required(action: THROW)
      }
    `,
    userRef
  );

  const navigateBack = useBackButton({ username: user.username });

  return (
    <GenericActionModal
      action={() => {
        navigateBack();
      }}
      bodyText={'Would you like to stop editing?'}
      buttonText={'Leave'}
    />
  );
}

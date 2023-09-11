import { useState } from 'react';
import { graphql, useFragment } from 'react-relay';

import { CheckInFormFragment$key } from '~/generated/CheckInFormFragment.graphql';

import CheckInEmailEntry from './CheckInEmailEntry';
import CheckInWalletSelection from './CheckInWalletSelection';

type Props = {
  closeSheet: () => void;
  viewerRef: CheckInFormFragment$key;
};

export default function CheckInForm({ closeSheet, viewerRef }: Props) {
  const viewer = useFragment(
    graphql`
      fragment CheckInFormFragment on Viewer {
        user @required(action: THROW) {
          ...CheckInWalletSelectionFragment
        }
        ...CheckInEmailEntryFragment
      }
    `,
    viewerRef
  );

  const [confirmedWalletAddress, setConfirmedWalletAddress] = useState('');

  return confirmedWalletAddress ? (
    <CheckInEmailEntry
      viewerRef={viewer}
      confirmedWalletAddress={confirmedWalletAddress}
      setConfirmedWalletAddress={setConfirmedWalletAddress}
      closeSheet={closeSheet}
    />
  ) : (
    <CheckInWalletSelection
      setConfirmedWalletAddress={setConfirmedWalletAddress}
      userRef={viewer.user}
    />
  );
}

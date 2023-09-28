import { startTransition, useCallback, useContext } from 'react';
import { graphql } from 'react-relay';

import { RelayResetContext } from '~/contexts/RelayResetContext';
import { useLogoutMutation } from '~/generated/useLogoutMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

type Props = {
  onLogout?: () => void;
};

export const useLogout = ({ onLogout }: Props) => {
  const [logout] = usePromisifiedMutation<useLogoutMutation>(
    graphql`
      mutation useLogoutMutation {
        logout {
          __typename
        }
      }
    `
  );

  const reset = useContext(RelayResetContext);

  return useCallback(async () => {
    await logout({
      variables: {},
    });

    // Wipe the relay cache and show the old content while
    // the new content is loading in the background.
    startTransition(() => {
      if (onLogout) {
        onLogout();
      }

      reset?.();
    });
  }, [logout, onLogout, reset]);
};

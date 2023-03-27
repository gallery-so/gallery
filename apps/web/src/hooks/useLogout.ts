import { startTransition, useCallback, useContext } from 'react';
import { graphql } from 'react-relay';

import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { RelayResetContext } from '~/contexts/RelayResetContext';
import { useLogoutMutation } from '~/generated/useLogoutMutation.graphql';
import { usePromisifiedMutation } from '~/shared/relay/usePromisifiedMutation';

export const useLogout = () => {
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

  const { hideDrawer } = useDrawerActions();

  return useCallback(async () => {
    await logout({
      variables: {},
    });

    // Wipe the relay cache and show the old content while
    // the new content is loading in the background.
    startTransition(() => {
      hideDrawer();
      reset?.();
    });
  }, [hideDrawer, logout, reset]);
};

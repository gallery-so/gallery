import { startTransition, useCallback, useContext } from 'react';
import { graphql } from 'react-relay';

import { useDrawerActions } from '~/contexts/globalLayout/GlobalSidebar/SidebarDrawerContext';
import { RelayResetContext } from '~/contexts/RelayResetContext';
import { AuthContextLogoutMutation } from '~/generated/AuthContextLogoutMutation.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
export const useLogout = () => {
  const [logout] = usePromisifiedMutation<AuthContextLogoutMutation>(
    graphql`
      mutation AuthContextLogoutMutation {
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

    startTransition(() => {
      hideDrawer();
      reset?.();
    });
  }, [hideDrawer, logout, reset]);
};

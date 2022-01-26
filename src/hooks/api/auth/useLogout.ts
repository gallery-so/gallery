import { useCallback } from 'react';
import usePost from '../_rest/usePost';

type LogoutResponse = {
  success: boolean;
};

export default function useLogout() {
  const logout = usePost();

  return useCallback(async () => {
    await logout<LogoutResponse>('/auth/logout', 'logout', {});
  }, [logout]);
}

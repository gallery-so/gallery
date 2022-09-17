import { useRefreshToken } from 'hooks/api/tokens/useRefreshToken';
import { useCallback } from 'react';
import { useReportError } from 'contexts/errorReporting/ErrorReportingContext';
import { useToastActions } from 'contexts/toast/ToastContext';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useRefreshMetadataFragment$key } from '../../../../__generated__/useRefreshMetadataFragment.graphql';

export function useRefreshMetadata(
  tokenRef: useRefreshMetadataFragment$key
): [() => void, boolean] {
  const { dbid } = useFragment(
    graphql`
      fragment useRefreshMetadataFragment on Token {
        dbid
      }
    `,
    tokenRef
  );

  const reportError = useReportError();
  const { pushToast } = useToastActions();
  const [refreshToken, isRefreshing] = useRefreshToken();

  const refresh = useCallback(async () => {
    try {
      pushToast({
        message: 'This piece is being updated with the latest metadata. Check back in few minutes.',
        autoClose: true,
      });

      await refreshToken(dbid);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reportError(error, {
          tags: {
            tokenId: dbid,
          },
        });

        pushToast({
          message: error.message,
          autoClose: true,
        });
      } else {
        reportError('Error while refreshing token, unknown error');

        pushToast({
          message: "Something went wrong, we're looking into it now.",
        });
      }
    }
  }, [dbid, pushToast, refreshToken, reportError]);

  return [refresh, isRefreshing];
}

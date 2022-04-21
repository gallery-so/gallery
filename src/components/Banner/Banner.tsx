import colors from 'components/core/colors';
import { BaseM } from 'components/core/Text/Text';
import usePersistedState from 'hooks/usePersistedState';
import { useCallback } from 'react';
import { graphql, useFragment } from 'react-relay';
import styled from 'styled-components';

type Props = {
  queryRef: any;
  text: string;
  requireAuth?: boolean;
};

const JAN_18_MIGRATION_BANNER_DISMISSED_LOCAL_STORAGE_KEY = 'jan_18_migration_banner_dismissed';

export default function Banner({ queryRef, text, requireAuth = false }: Props) {
  const query = useFragment(
    graphql`
      fragment BannerFragment on Query {
        viewer {
          ... on Viewer {
            user {
              id
            }
          }
        }
      }
    `,
    queryRef
  );

  const isAuthenticated = Boolean(query.viewer?.user?.id);

  const [dismissed, setDismissed] = usePersistedState(
    JAN_18_MIGRATION_BANNER_DISMISSED_LOCAL_STORAGE_KEY,
    false
  );

  const hideBanner = useCallback(() => {
    setDismissed(true);
  }, [setDismissed]);

  return dismissed || text.length === 0 || (requireAuth && !isAuthenticated) ? null : (
    <StyledBanner>
      <StyledClose onClick={hideBanner}>&#x2715;</StyledClose>
      <BaseM color={colors.white}>{text}</BaseM>
    </StyledBanner>
  );
}

const StyledBanner = styled.div`
  background: black;
  text-align: center;
  width: 100%;
  padding: 20px 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  z-index: 1;
`;

const StyledClose = styled.span`
  position: absolute;
  right: 0px;
  padding: 12px 12px;
  cursor: pointer;
  color: white;
`;

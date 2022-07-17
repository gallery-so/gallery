import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMaxColumnsFragment$key } from '__generated__/useMaxColumnsFragment.graphql';

const USER_IDS_WITH_10_COLUMNS_ENABLED = [
  'a3ff91986625382ff776067619200efe',
  '2BzTRFDU9wuQCYW6E62cY6J6XvU',
];

export default function useMaxColumns(viewerRef: useMaxColumnsFragment$key) {
  const viewer = useFragment(
    graphql`
      fragment useMaxColumnsFragment on Viewer {
        user {
          dbid
        }
      }
    `,
    viewerRef
  );

  // allow larger # columns for figure31 user profile
  if (USER_IDS_WITH_10_COLUMNS_ENABLED.includes(viewer.user?.dbid ?? '')) {
    return 10;
  }

  return 6;
}

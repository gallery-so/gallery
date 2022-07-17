import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMaxColumnsFragment$key } from '__generated__/useMaxColumnsFragment.graphql';

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
  if (viewer.user?.dbid === 'a3ff91986625382ff776067619200efe') {
    return 10;
  }

  return 6;
}

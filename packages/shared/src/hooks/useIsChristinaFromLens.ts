import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { useIsChristinaFromLensFragment$key } from '~/generated/useIsChristinaFromLensFragment.graphql';

export function useIsChristinaFromLens(userRef: useIsChristinaFromLensFragment$key) {
  const user = useFragment(
    graphql`
      fragment useIsChristinaFromLensFragment on GalleryUser {
        dbid
      }
    `,
    userRef
  );

  return user.dbid === '24DZnxmFR43gwRJU35O2oxepKbB';
}

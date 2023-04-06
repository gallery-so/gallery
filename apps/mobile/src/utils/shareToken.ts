import { Share } from 'react-native';
import { graphql, readInlineData } from 'relay-runtime';

import { shareTokenFragment$key } from '~/generated/shareTokenFragment.graphql';

export function shareToken(tokenRef: shareTokenFragment$key) {
  const token = readInlineData(
    graphql`
      fragment shareTokenFragment on Token @inline {
        dbid

        owner {
          username
        }
      }
    `,
    tokenRef
  );

  if (token.owner?.username) {
    Share.share({
      url: `https://gallery.so/${token.owner.username}/${token.dbid}`,
    });
  }
}

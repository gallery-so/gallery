import { Share } from 'react-native';
import { graphql, readInlineData } from 'relay-runtime';

import { shareTokenFragment$key } from '~/generated/shareTokenFragment.graphql';

export async function shareToken(collectionTokenRef: shareTokenFragment$key) {
  const collectionToken = readInlineData(
    graphql`
      fragment shareTokenFragment on CollectionToken @inline {
        collection {
          dbid
        }
        token {
          dbid
          owner {
            username
          }
        }
      }
    `,
    collectionTokenRef
  );

  if (
    collectionToken.token?.owner?.username &&
    collectionToken.collection &&
    collectionToken.token
  ) {
    const url = `https://gallery.so/${collectionToken.token.owner.username}/${collectionToken.collection?.dbid}/${collectionToken.token?.dbid}`;

    console.log(url);

    Share.share({ url });
  }
}

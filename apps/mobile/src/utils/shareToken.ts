import { Share } from 'react-native';
import { graphql, readInlineData } from 'relay-runtime';

import { shareTokenCollectionFragment$key } from '~/generated/shareTokenCollectionFragment.graphql';
import { shareTokenFragment$key } from '~/generated/shareTokenFragment.graphql';
import { shareTokenUniversalFragment$key } from '~/generated/shareTokenUniversalFragment.graphql';

export async function shareToken(
  tokenRef: shareTokenFragment$key,
  collectionRef: shareTokenCollectionFragment$key | null
) {
  const collection = readInlineData(
    graphql`
      fragment shareTokenCollectionFragment on Collection @inline {
        dbid
      }
    `,
    collectionRef
  );

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

  // TODO(Terence) We need to handle the case where we're missing a collectionId
  if (token.owner?.username && collection?.dbid) {
    const url = `https://gallery.so/${token.owner.username}/${collection?.dbid}/${token.dbid}`;

    Share.share({ url });
  }
}

export async function shareUniversalToken(tokenRef: shareTokenUniversalFragment$key) {
  const token = readInlineData(
    graphql`
      fragment shareTokenUniversalFragment on Token @inline {
        dbid
        owner {
          username
        }
      }
    `,
    tokenRef
  );

  if (token.owner?.username) {
    const url = `https://gallery.so/${token.owner.username}/token/${token.dbid}`;

    Share.share({ url });
  }
}

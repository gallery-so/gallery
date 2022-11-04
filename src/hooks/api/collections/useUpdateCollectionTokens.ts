import { captureException } from '@sentry/nextjs';
import { useCallback } from 'react';
import { useRelayEnvironment } from 'react-relay';
import { fetchQuery, graphql } from 'relay-runtime';

import { StagedCollection } from '~/components/ManageGallery/OrganizeCollection/types';
import { TokenSettings } from '~/contexts/collectionEditor/CollectionEditorContext';
import { useUpdateCollectionTokensMutation } from '~/generated/useUpdateCollectionTokensMutation.graphql';
import { useUpdateCollectionTokensRefresherQuery } from '~/generated/useUpdateCollectionTokensRefresherQuery.graphql';
import { usePromisifiedMutation } from '~/hooks/usePromisifiedMutation';
import { generateLayoutFromCollection, getTokenIdsFromCollection } from '~/utils/collectionLayout';
import { collectionTokenSettingsObjectToArray } from '~/utils/collectionTokenSettings';

type Props = {
  collectionId: string;
  stagedCollection: StagedCollection;
  tokenSettings: TokenSettings;
  caption: string | null;
};

export default function useUpdateCollectionTokens() {
  const relayEnvironment = useRelayEnvironment();
  const [updateCollectionTokens] = usePromisifiedMutation<useUpdateCollectionTokensMutation>(
    graphql`
      mutation useUpdateCollectionTokensMutation($input: UpdateCollectionTokensInput!) {
        updateCollectionTokens(input: $input) {
          __typename
        }
      }
    `
  );

  return useCallback(
    async ({ caption, collectionId, stagedCollection, tokenSettings }: Props) => {
      const layout = generateLayoutFromCollection(stagedCollection);
      const tokenIds = getTokenIdsFromCollection(stagedCollection);
      const tokenSettingsArray = collectionTokenSettingsObjectToArray(tokenSettings);

      const response = await updateCollectionTokens({
        variables: {
          input: {
            collectionId,
            tokens: tokenIds,
            layout,
            tokenSettings: tokenSettingsArray,
            caption: caption || null,
          },
        },
      });

      if (response.updateCollectionTokens?.__typename !== 'UpdateCollectionTokensPayload') {
        // TODO(Terence): How do we really want to handle this.
        const error = new Error(
          `Error updating collection tokens: response typename: ${response.updateCollectionTokens?.__typename}`
        );
        captureException(error);
        throw error;
      }

      // Until everything is routed through GraphQL, we need
      // a mechanism to ensure that other pages using this data
      // get the updated data.
      //
      // This fetchQuery asks the server for a collection.
      // We're also ensuring that any other pages that need data
      // off of a collection are getting their data requirements
      // refreshed. These four fragments are the only fragmeents
      // on this type, so we should be good.
      //
      // If you want to ensure this list of fragments is up to date
      // you can global search for `on Collection` to find
      // all of the fragments on this type.
      //
      // In other places, we can do an optimistic update since
      // there's not much data to update (hidden, collectorsNote, etc).
      // Here, we'd have to optimistically update a bunch of tokens which
      // is more risky since that mapping logic might get out of hand.
      // The safer approach here is to just refetch the data.
      await fetchQuery<useUpdateCollectionTokensRefresherQuery>(
        relayEnvironment,
        graphql`
          query useUpdateCollectionTokensRefresherQuery($id: DBID!) {
            collectionById(id: $id) {
              ...NftGalleryFragment
              ...CollectionRowFragment
              ...CollectionRowDraggingFragment
              ...CollectionRowSettingsFragment
              ...CollectionRowWrapperFragment
              ...DeleteCollectionConfirmationFragment
              ...SortableCollectionRowFragment
              ...UserGalleryCollectionFragment
              ...CollectionGalleryHeaderFragment
            }
          }
        `,
        {
          id: collectionId,
        }
      ).toPromise();
    },
    [relayEnvironment, updateCollectionTokens]
  );
}

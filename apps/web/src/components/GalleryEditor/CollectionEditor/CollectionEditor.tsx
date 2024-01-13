import React, { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import useNotOptimizedForMobileWarning from '~/components/ManageGallery/useNotOptimizedForMobileWarning';
import { CollectionEditorFragment$key } from '~/generated/CollectionEditorFragment.graphql';
import { CollectionEditorViewerFragment$key } from '~/generated/CollectionEditorViewerFragment.graphql';
import { removeNullValues } from '~/shared/relay/removeNullValues';

import StagingArea from './StagingArea';

type Props = {
  queryRef: CollectionEditorFragment$key;
};

// Separated out so we can refresh data as a part of our sync tokens mutation
const collectionEditorViewerFragment = graphql`
  fragment CollectionEditorViewerFragment on Viewer {
    user @required(action: THROW) {
      tokens(ownershipFilter: [Creator, Holder]) {
        ...StagingAreaFragment

        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        definition {
          # Escape hatch for data processing util files
          # CollectionEditor could use a refactor
          # eslint-disable-next-line relay/unused-fields
          name @required(action: THROW)
          # Escape hatch for data processing util files
          # CollectionEditor could use a refactor
          # eslint-disable-next-line relay/unused-fields
          contract {
            isSpam
          }
        }
        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        isSpamByUser
      }
    }
  }
`;

export function CollectionEditor({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorFragment on Query {
        viewer {
          ... on Viewer {
            ...CollectionEditorViewerFragment
          }
        }
      }
    `,
    queryRef
  );

  const viewer = useFragment<CollectionEditorViewerFragment$key>(
    collectionEditorViewerFragment,
    query.viewer
  );

  if (!viewer) {
    throw new Error('CollectionEditor rendered without a Viewer');
  }

  useNotOptimizedForMobileWarning();

  const allNfts = useMemo(() => {
    return removeNullValues(viewer.user.tokens ?? []);
  }, [viewer.user.tokens]);

  return <StagingArea tokensRef={allNfts} />;
}

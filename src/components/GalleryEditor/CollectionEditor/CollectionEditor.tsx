import React, { useMemo } from 'react';
import { graphql, useFragment } from 'react-relay';

import useConfirmationMessageBeforeClose from '~/components/ManageGallery/useConfirmationMessageBeforeClose';
import useNotOptimizedForMobileWarning from '~/components/ManageGallery/useNotOptimizedForMobileWarning';
import { CollectionEditorNewFragment$key } from '~/generated/CollectionEditorNewFragment.graphql';
import { CollectionEditorViewerNewFragment$key } from '~/generated/CollectionEditorViewerNewFragment.graphql';
import { removeNullValues } from '~/utils/removeNullValues';

import StagingArea from './StagingArea';

type Props = {
  hasUnsavedChanges: boolean;
  queryRef: CollectionEditorNewFragment$key;
  onValidChange: (valid: boolean) => void;
  onHasUnsavedChange: (hasUnsavedChanges: boolean) => void;
};

// Separated out so we can refresh data as a part of our sync tokens mutation
const collectionEditorViewerFragment = graphql`
  fragment CollectionEditorViewerNewFragment on Viewer {
    user @required(action: THROW) {
      tokens {
        ...StagingAreaNewFragment

        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        name @required(action: THROW)
        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        isSpamByProvider
        # Escape hatch for data processing util files
        # CollectionEditor could use a refactor
        # eslint-disable-next-line relay/unused-fields
        isSpamByUser
      }
    }
  }
`;

export function CollectionEditor({
  queryRef,
  onValidChange,
  onHasUnsavedChange,
  hasUnsavedChanges,
}: Props) {
  const query = useFragment(
    graphql`
      fragment CollectionEditorNewFragment on Query {
        viewer {
          ... on Viewer {
            ...CollectionEditorViewerNewFragment
          }
        }
      }
    `,
    queryRef
  );

  const viewer = useFragment<CollectionEditorViewerNewFragment$key>(
    collectionEditorViewerFragment,
    query.viewer
  );

  if (!viewer) {
    throw new Error('CollectionEditor rendered without a Viewer');
  }

  useNotOptimizedForMobileWarning();
  useConfirmationMessageBeforeClose(hasUnsavedChanges);
  // useCheckUnsavedChanges(onHasUnsavedChange);

  // useEffect(
  //   function notifyParentWhenCollectionIsValid() {
  //     const isCollectionValid = Object.keys(stagedCollectionState).length > 0;
  //
  //     onValidChange(isCollectionValid);
  //   },
  //   [stagedCollectionState, onValidChange]
  // );

  const allNfts = useMemo(() => {
    return removeNullValues(viewer.user.tokens ?? []);
  }, [viewer.user.tokens]);

  return <StagingArea tokensRef={allNfts} />;
}

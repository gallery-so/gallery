import { useCallback } from 'react';

import IconContainer from '~/components/core/IconContainer';
import { useCollectionEditorContext } from '~/contexts/collectionEditor/CollectionEditorContext';
import { AddAllTextIcon } from '~/icons/AddAllTextIcon';

import { CollectionTitleRow } from './SidebarList';

type Props = {
  row: CollectionTitleRow;
};

export default function AddAllIcon({ row }: Props) {
  const { addNewTokensToActiveSection } = useCollectionEditorContext();

  const handleStageAllTokensWithinContract = useCallback(() => {
    addNewTokensToActiveSection(row.tokenIds);
  }, [addNewTokensToActiveSection, row.tokenIds]);

  if (row.count < 3) {
    return null;
  }

  return (
    <IconContainer
      onClick={handleStageAllTokensWithinContract}
      stopPropagation
      variant="stacked"
      size="sm"
      icon={<AddAllTextIcon />}
      tooltipLabel="Stage all pieces in the editor"
    />
  );
}

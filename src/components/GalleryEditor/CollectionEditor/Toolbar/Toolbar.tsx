import styled from 'styled-components';

import colors from '~/components/core/colors';
import { HStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeM } from '~/components/core/Text/Text';
import { MinusIcon } from '~/components/GalleryEditor/CollectionEditor/Toolbar/MinusIcon';
import { PlusIcon } from '~/components/GalleryEditor/CollectionEditor/Toolbar/PlusIcon';
import { TrashIcon } from '~/components/GalleryEditor/CollectionEditor/Toolbar/TrashIcon';

type Props = {
  onDecrement: () => void;
  onIncrement: () => void;
};

export function Toolbar({ onDecrement, onIncrement }: Props) {
  return (
    <SectionToolbar justify="space-between">
      <ToolkitAction>
        <ToolkitText>Section</ToolkitText>
      </ToolkitAction>

      <HStack gap={2}>
        <ToolkitAction align="center" gap={2}>
          <MinusIcon onClick={onDecrement} />
          <ToolkitText>Columns</ToolkitText>
          <PlusIcon onClick={onIncrement} />
        </ToolkitAction>
        <ToolkitAction align="center">
          <TrashIcon />
        </ToolkitAction>
      </HStack>
    </SectionToolbar>
  );
}

const ToolkitText = styled(TitleDiatypeM)`
  color: ${colors.offWhite};
`;

const ToolkitAction = styled(HStack)`
  background-color: ${colors.activeBlue};
  padding: 2px 4px;
  color: ${colors.offWhite};
  border-radius: 2px;
`;

const SectionToolbar = styled(HStack)`
  padding: 2px 2px 16px 2px;
  user-select: none;
`;

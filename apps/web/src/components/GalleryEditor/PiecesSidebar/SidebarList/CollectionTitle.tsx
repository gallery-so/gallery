import { useMemo, useState } from 'react';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { TitleXS } from '~/components/core/Text/Text';
import {
  SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE,
  SIDEBAR_COLLECTION_TITLE_HEIGHT,
} from '~/constants/sidebar';
import colors from '~/shared/theme/colors';

import OnboardingDialog from '../../GalleryOnboardingGuide/OnboardingDialog';
import { useOnboardingDialogContext } from '../../GalleryOnboardingGuide/OnboardingDialogContext';
import { ExpandedIcon } from '../ExpandedIcon';
import { TokenFilterType } from '../SidebarViewSelector';
import { CollectionTitleRow } from './SidebarList';
import ToggleSpamIcon, { SetSpamFn } from './ToggleSpamIcon';

export default function CollectionTitle({
  row,
  key,
  index,
  style,
  selectedView,
  onToggleExpanded,
  setSpamPreferenceForCollection,
}: {
  row: CollectionTitleRow;
  key: string;
  index: number;
  style: React.CSSProperties;
  selectedView: TokenFilterType;
  onToggleExpanded: (address: string) => void;
  setSpamPreferenceForCollection: SetSpamFn;
}) {
  const { step, dialogMessage, nextStep, handleClose } = useOnboardingDialogContext();

  const [isMouseHovering, setIsMouseHovering] = useState(false);

  const shouldDisplayToggleSpamIcon = useMemo(() => {
    if (selectedView === 'Created') {
      return false;
    }
    return isMouseHovering;
  }, [selectedView, isMouseHovering]);

  return (
    <CollectionTitleRow style={style}>
      <CollectionTitleContainer
        key={key}
        onClick={() => onToggleExpanded(row.address)}
        onMouseEnter={() => setIsMouseHovering(true)}
        onMouseLeave={() => setIsMouseHovering(false)}
        align="center"
        justify="space-between"
        gap={4}
      >
        <LeftContent align="center">
          <ExpandedIcon expanded={row.expanded} />
          <CollectionTitleText title={row.title}>{row.title}</CollectionTitleText>
        </LeftContent>
        {shouldDisplayToggleSpamIcon ? (
          <ToggleSpamIcon
            row={row}
            selectedView={selectedView}
            setSpamPreferenceForCollection={setSpamPreferenceForCollection}
          />
        ) : (
          <CollectionCount>{row.count}</CollectionCount>
        )}
      </CollectionTitleContainer>

      {step === 4 && index === 0 && (
        <OnboardingDialog
          step={4}
          text={dialogMessage}
          onNext={nextStep}
          onClose={handleClose}
          options={{
            placement: 'left',
            positionOffset: 40,
            blinkingPosition: {
              top: 40,
              left: 7,
            },
          }}
        />
      )}
    </CollectionTitleRow>
  );
}

const LeftContent = styled(HStack)`
  overflow: hidden;
`;

const CollectionTitleText = styled(TitleXS)`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const CollectionCount = styled(TitleXS)`
  padding-right: 4px;
`;

const CollectionTitleRow = styled.div`
  padding-bottom: ${SIDEBAR_COLLECTION_TITLE_BOTTOM_SPACE}px;

  position: relative;
`;

const CollectionTitleContainer = styled(HStack).attrs({ role: 'button' })`
  cursor: pointer;

  height: ${SIDEBAR_COLLECTION_TITLE_HEIGHT}px;
  padding: 0 4px;
  margin: 4px 0px;

  border-radius: 2px;

  &:hover {
    background: ${colors.faint};
  }
`;

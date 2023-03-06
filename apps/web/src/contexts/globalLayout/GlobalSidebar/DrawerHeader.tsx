import { useCallback } from 'react';
import styled from 'styled-components';

import IconContainer from '~/components/core/IconContainer';
import { HStack, VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import CloseIcon from '~/icons/CloseIcon';

import { useDrawerActions } from './SidebarDrawerContext';

type Props = {
  headerText?: string;
};

export default function DrawerHeader({ headerText }: Props) {
  const { hideDrawer } = useDrawerActions();

  const handleCloseDrawerClick = useCallback(() => {
    hideDrawer();
  }, [hideDrawer]);
  return (
    <StyledHeader>
      <CloseDrawerHeader align="center" justify="flex-end">
        <IconContainer
          variant="default"
          size="sm"
          onClick={handleCloseDrawerClick}
          icon={<CloseIcon />}
        />
      </CloseDrawerHeader>
      {headerText && <StyledHeadingText>{headerText}</StyledHeadingText>}
    </StyledHeader>
  );
}

const StyledHeader = styled(VStack)`
  padding: 0 16px;
`;

// one-off text style that's not in our design system
const StyledHeadingText = styled(TitleDiatypeL)`
  font-size: 24px;
  line-height: 28px;
`;

const CloseDrawerHeader = styled(HStack)`
  height: 52px;
`;

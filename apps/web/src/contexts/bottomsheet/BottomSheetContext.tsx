import React, { createContext, memo, useCallback, useContext, useMemo, useState } from 'react';
import colors from 'shared/theme/colors';
import styled from 'styled-components';
import { Drawer } from 'vaul';

type BottomSheetState = {
  isBottomSheetModalVisible: boolean;
};
const BottomSheetStateContext = createContext<BottomSheetState | undefined>(undefined);

export const useBottomSheetModalState = (): BottomSheetState => {
  const context = useContext(BottomSheetStateContext);
  if (!context) {
    throw new Error('Attempted to use BottomSheetModalStateContext without a provider!');
  }
  return context;
};

type BottomSheetActions = {
  showBottomSheet: (bottomSheetModal: BottomSheet) => void;
  hideBottomSheet: () => void;
};

const BottomSheetActionsContext = createContext<BottomSheetActions | undefined>(undefined);

export const useBottomSheetActions = (): BottomSheetActions => {
  const context = useContext(BottomSheetActionsContext);
  if (!context) {
    throw new Error('Attempted to use BottomSheetModalActionsContext without a provider!');
  }
  return context;
};

type BottomSheetModalProviderProps = {
  children: React.ReactNode;
};

type BottomSheet = {
  content: React.ReactNode;
};

function BottomSheetProvider({ children }: BottomSheetModalProviderProps) {
  const [bottomSheetModalContent, setBottomSheetModalContent] = useState<BottomSheet>();
  const [open, setOpen] = useState(false);

  const showBottomSheet = useCallback((modal: BottomSheet) => {
    setBottomSheetModalContent(modal);
    setOpen(true);
  }, []);

  const hideBottomSheet = useCallback(() => {
    setOpen(false);

    // delay clearing the content to allow the modal to animate out
    setTimeout(() => {
      setBottomSheetModalContent(undefined);
    }, 300);
  }, []);

  const actions = useMemo(
    () => ({
      showBottomSheet,
      hideBottomSheet,
    }),
    [showBottomSheet, hideBottomSheet]
  );

  return (
    <BottomSheetActionsContext.Provider value={actions}>
      {bottomSheetModalContent && (
        <Drawer.Root open={open} onClose={hideBottomSheet} dismissible shouldScaleBackground>
          <Drawer.Portal>
            <StyledOverlay onClick={hideBottomSheet} />
            <StyledContent>
              <StyledDragHandleWrapper>
                <StyledDragHandle />
              </StyledDragHandleWrapper>
              {bottomSheetModalContent.content}
            </StyledContent>
          </Drawer.Portal>
        </Drawer.Root>
      )}
      {children}
    </BottomSheetActionsContext.Provider>
  );
}

export default memo(BottomSheetProvider);

const StyledOverlay = styled(Drawer.Overlay)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 40;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
`;

const StyledContent = styled(Drawer.Content)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 24px;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  background-color: white;
  padding: 16px 24px;
`;

const StyledDragHandleWrapper = styled.div`
  padding: 8px 16px 16px 16px;
`;
const StyledDragHandle = styled.div`
  border-radius: 4px;
  background-color: ${colors.porcelain};
  height: 4px;
  width: 83px;
  margin: 0 auto;
`;

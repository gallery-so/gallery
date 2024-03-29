import { useCallback } from 'react';
import styled from 'styled-components';

import { useModalActions } from '~/contexts/modal/ModalContext';
import QRIcon from '~/icons/QRIcon';
import QRCodePopover from '~/scenes/Modals/QRCodePopover';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

export default function QRCode({ username }: { username: string }) {
  const { showModal } = useModalActions();
  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Profile QR Code Click', { username });

    showModal({
      content: <QRCodePopover username={username} />,
      isFullPage: true,
    });
  }, [track, username, showModal]);

  return (
    <StyledButton onClick={handleClick} title="Open QR code">
      <QRIcon />
    </StyledButton>
  );
}

const StyledButton = styled.button`
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
  height: 24px;
  width: 24px;

  & svg path {
    stroke: ${colors.black['800']};
  }
`;

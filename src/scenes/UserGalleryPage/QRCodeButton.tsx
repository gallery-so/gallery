import colors from 'components/core/colors';
import styled from 'styled-components';
import { useCallback } from 'react';
import QRIcon from 'src/icons/QRIcon';
import { useModalActions } from 'contexts/modal/ModalContext';
import { useTrack } from 'contexts/analytics/AnalyticsContext';
import QRCodePopover from 'scenes/Modals/QRCodePopover';

export default function QRCode({
  username,
  styledQrCode,
}: {
  username: string;
  styledQrCode: any;
}) {
  const { showModal } = useModalActions();
  const track = useTrack();

  const handleClick = useCallback(() => {
    track('Profile QR Code Click', { username });

    showModal({
      content: <QRCodePopover username={username} styledQrCode={styledQrCode} />,
      isFullPage: true,
    });
  }, [track, username, showModal, styledQrCode]);

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
    stroke: ${colors.offBlack};
  }
`;

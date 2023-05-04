import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleM } from '~/components/core/Text/Text';
import QRCode from '~/components/QRCode/QRCode';

export default function QRCodePopover({ username }: { username: string }) {
  return (
    <StyledQRCodePopover>
      <VStack gap={24} align="center">
        <QRCode width={159} height={159} encodedData={`https://gallery.so/${username}`} />
        <TitleM>
          <strong>{username}</strong>
        </TitleM>
      </VStack>
      <StyledBaseM>Scan to open {username}'s gallery in a new browser tab.</StyledBaseM>
    </StyledQRCodePopover>
  );
}

const StyledQRCodePopover = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  place-items: center;
`;

const StyledBaseM = styled(BaseM)`
  text-align: center;
  position: absolute;
  bottom: 32px;
`;

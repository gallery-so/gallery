import styled from 'styled-components';

import { VStack } from '~/components/core/Spacer/Stack';
import { BaseM, TitleL } from '~/components/core/Text/Text';

const QR_CODE_URL =
  'https://storage.googleapis.com/gallery-prod-325303.appspot.com/landingPage/appstore-qr.jpeg';

export default function DownloadAppQrModal() {
  console.log({});
  return (
    <StyledModal align="center" gap={32}>
      <TitleL>Download App</TitleL>
      <StyledQrCode src={QR_CODE_URL} />
      <StyledBaseM>
        Scan the QR code or search for Gallery Digital Art on the App Store.
      </StyledBaseM>
    </StyledModal>
  );
}

const StyledModal = styled(VStack)`
  padding: 32px;
`;

const StyledQrCode = styled.img`
  width: 250px;
  height: 250px;
`;

const StyledBaseM = styled(BaseM)`
  font-size: 16px;
`;

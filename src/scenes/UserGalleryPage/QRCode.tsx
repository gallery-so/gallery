import colors from 'components/core/colors';
import styled from 'styled-components';
import { useCallback, useRef } from 'react';
import Spacer from 'components/core/Spacer/Spacer';
import QRIcon from 'src/icons/QRIcon';
import FullScreenModal from 'scenes/Modals/FullScreenModal';
import { useModalActions } from 'contexts/modal/ModalContext';
import { BaseM, TitleM } from 'components/core/Text/Text';

export default function QRCode({ username }: { username: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Dynamically import qr-code-styling on the client-side, not compatible with regular Next imports
  // https://github.com/kozakdenys/qr-code-styling/issues/38
  const renderQRCode = useCallback(() => {
    if (typeof window !== 'undefined') {
      const QRCodeStyling = require('qr-code-styling');

      // We render the canvas element with a width and height of 636px (4x the initial)
      // and then we scale it down to its proper width and height (159px) using CSS.
      // This makes the QR appear high res
      const qrCode = new QRCodeStyling({
        width: 636, // 4 * 159px
        height: 636, // 4 * 159px
        data: `https://gallery.so/${username}`,
        margin: 0,
        qrOptions: { typeNumber: '0', mode: 'Byte', errorCorrectionLevel: 'Q' },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
        dotsOptions: { type: 'square', color: '#000000', gradient: null },
        backgroundOptions: { color: '#ffffff', gradient: null },
        image:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJcAAACWCAYAAADTwxrcAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVNSURBVHgB7d3dUSNHFIbhA4hrY0D3IgJrI7CIwOsIFkdgNgIgAnsjgI0AE8EOGeAIVr6GC90Dwt8RzZYWj3qEdmZx9XmfKpVAM0hU6avunp7+MQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQtjXDQluyubk50I/Dh4eHLX8pHZro9/H6+vr4+vr6ylCLcD3jger1er/rx1F6NJnoUa2trV0oaGd1J2xvbx8qiLNg3t3dnU0mk7EFQLiS3d3dkZ6ObLlA1Uql2cl8yJTVgcL6ee60/Zubm8oCWLfgvKRSsP7Qj58sEyyVTGM9VenhVeGk5pyBAna6s7Pzud/vH/hrCtsvFlTokku5Gm5sbJx7KBacUulxoqrsSlXZpO7v1SYbTqfTo8x7PBem5AobLpUu7xSIswWHKwXqvfK0dGPdSyqVWl4CbjWcSrVYslyw9PoHffn7LwmW83aWAvnG212GmXDhUrDeZkosb4wf2or8KvD+/n7fatpjEYUKl1+5KVinCw5XKrGO7RulboZfDbHCpca7XxHWtolUpf1mLfE2larHjxZcmHCpuyF3RXfSdsemqsdjCy5EuLw6VElyUHfMG+Dea24tS2GtLLAQ4VJ1eJzry+rwdsyJBVZ8uFIj/t2i46q+OguAd75a4CvH4sOlHvRR5vBVlzeRU69+2FETxYfLb80sOqYS7dI6pjbd3xZU0eHykQ65e3764v+y7lUWVNHhUnje5o6nNlGn1KYLWy32rGAqtX7OHK4d6dCB2WDCp1/0P4Vp4BcbLh+npadh5pR/7DtIAd63gIqtFnu93rDhFMa+d6zkNtcodzCNLEWHig2XGvPDhuNjQ6eKDZdKph8Mr6rkajFbcqkbYmzoVMnhahrLjo4VGa7UDZEVZWLqayq1n6vVUivNwj63DvgI2FKDXnQPfYs8rCPDi4SfcY3uUHItwast1Yx76VevIr9Uu2kK/0A/+n3M0bJvaY8zuauS235FzriuWfzjP/TF/tj2jWv/XJ9h1DS1X5+9F+GCoshqcckvrvWuCv9cBatpitpFlCvVkttcrzK0xecsNty3rCyIkm//ZMOlanNgHZlOpwuHT/tqhBZEseHSF5wdu/6CJY9apf8rzGDBkqvFce5gWuMUHSo2XKp+soMBFa6fDJ0qNly3t7fZcKlabBqpim9UbLjS4m259s3A0KnSp5blJr1u9ft9Sq8OFR0utbuyk14VvpF1g5UFrfBwqd3l4cp90Z0s4x1pbmJO0eHye4cNVeNwmYGFWE3xQ25UivyZOewjHA4MnSg+XGnN9ypzStgdLroWZbBgboG3Udr3pzX0/j8KEa60uvKHzClH1i5KQws0zNlXV87MsvbS69Ba0LQmWCRhwuVXjg0D+Y7a6FT1XcsMM6EmaKTG/fsFh7em0+m5D1W2Fc2vde+lZPSNDsLN/lHAvGuitoHvwfAx8Ks08H2zKj0dz73XR90hqCywkFPL0h4/XoLVbsipp08Ky+kypZh3wurcs/nNqrzU8s9Y4g5B0aJv5rnMbJ1Kj0sF5urpto6fryp0qGcfEzaaP9mD5TuXPU3CUCn4fAfaMPsthp63mAKw5xtxZnZ7HflDx768oADZ/O9zr38VLKf3vVD1OLKAmHFtjxtxKhRv0tXkKstZzia5+ns8nzamcH2P5cj/l0JXi4t4dek7b6gk8s7Qp4V7v+p19+ljCk6lUunS21a5Cba+gajOm/29zi16ljUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC34F9wnFUw4gXCoAAAAAElFTkSuQmCC',
        dotsOptionsHelper: {
          colorType: { single: true, gradient: false },
          gradient: {
            linear: true,
            radial: false,
            color1: '#6a1a4c',
            color2: '#6a1a4c',
            rotation: '0',
          },
        },
        cornersSquareOptions: { type: '', color: '#000000' },
        cornersSquareOptionsHelper: {
          colorType: { single: true, gradient: false },
          gradient: {
            linear: true,
            radial: false,
            color1: '#000000',
            color2: '#000000',
            rotation: '0',
          },
        },
        cornersDotOptions: { type: '', color: '#000000' },
        cornersDotOptionsHelper: {
          colorType: { single: true, gradient: false },
          gradient: {
            linear: true,
            radial: false,
            color1: '#000000',
            color2: '#000000',
            rotation: '0',
          },
        },
        backgroundOptionsHelper: {
          colorType: { single: true, gradient: false },
          gradient: {
            linear: true,
            radial: false,
            color1: '#ffffff',
            color2: '#ffffff',
            rotation: '0',
          },
        },
      });

      qrCode.append(ref.current);
    }
  }, [username]);

  const { showModal } = useModalActions();
  const handleClick = useCallback(() => {
    // Need a brief timeout so that the modal renders before rendering QR code. Otherwise the ref will not exist and renderQRCode cannot append the ref
    setTimeout(() => {
      renderQRCode();
    }, 100);

    showModal({
      content: (
        <FullScreenModal
          body={
            <StyledFullScreenQR>
              <StyledQRWrapper ref={ref} />
              <Spacer height={24} />
              <TitleM>
                <strong>{username}</strong>
              </TitleM>
              <StyledBaseM>Scan to open {username}'s gallery in a new browser tab.</StyledBaseM>
            </StyledFullScreenQR>
          }
        />
      ),
    });
  }, [showModal, username, renderQRCode]);

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
  margin-right: 8px;

  & svg path {
    stroke: ${colors.offBlack};
  }
`;

const StyledFullScreenQR = styled.div`
  width: 100%;
  height: 100vh;

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

// In order to render the QR code at a higher quality, we render it at 10x its initial size, and then scale it down with the following CSS
const StyledQRWrapper = styled.div`
  height: 159px;
  width: 159px;
  transform: scale(0.25);
  display: flex;
  justify-content: center;
  place-items: center;
}
`;

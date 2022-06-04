import colors from 'components/core/colors';
import styled from 'styled-components';
import { useCallback, useState, useRef } from 'react';
import Spacer from 'components/core/Spacer/Spacer';
// import QRCodeStyling from 'qr-code-styling';

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.6667 3.33334L3.33333 12.6667" stroke="black" stroke-miterlimit="10" />
      <path d="M3.33333 3.33334L12.6667 12.6667" stroke="black" stroke-miterlimit="10" />
    </svg>
  );
}

function QRIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 6V2H18" stroke="black" stroke-miterlimit="10" />
      <path d="M2 18V22H6" stroke="black" stroke-miterlimit="10" />
      <path d="M18 22H22V18" stroke="black" stroke-miterlimit="10" />
      <path d="M6 2H2V6" stroke="black" stroke-miterlimit="10" />
      <path d="M10.5 5.5H5.5V10.5H10.5V5.5Z" stroke="black" stroke-miterlimit="10" />
      <path d="M18.5 5.5H13.5V10.5H18.5V5.5Z" stroke="black" stroke-miterlimit="10" />
      <path d="M13.5 19V16V13" stroke="black" stroke-miterlimit="10" />
      <path d="M18.5 16V18.5H16" stroke="black" stroke-miterlimit="10" />
      <path d="M16 13.5H19" stroke="black" stroke-miterlimit="10" />
      <path d="M10.5 13.5H5.5V18.5H10.5V13.5Z" stroke="black" stroke-miterlimit="10" />
      <path d="M7.5 8H8.5" stroke="black" stroke-miterlimit="10" />
      <path d="M15.5 8H16.5" stroke="black" stroke-miterlimit="10" />
      <path d="M7.5 16H8.5" stroke="black" stroke-miterlimit="10" />
      <path d="M16.5 16H13.5" stroke="black" stroke-miterlimit="10" />
    </svg>
  );
}

export default function QRCode({ username }: { username: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeExists, setQRCodeExists] = useState(false);

  const handleClick = useCallback(() => {
    setShowQRCode(true);

    // Dynamically import qr-code-styling on the client-side, not compatible with regular Next imports
    // https://github.com/kozakdenys/qr-code-styling/issues/38
    if (typeof window !== 'undefined') {
      if (qrCodeExists) return; // Prevent duplication
      const QRCodeStyling = require('qr-code-styling');

      const qrCode = new QRCodeStyling({
        width: 159,
        height: 159,
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
      setQRCodeExists(true);
    }
  }, [qrCodeExists, username]);

  return (
    <>
      <StyledFullScreenQR showQRCode={showQRCode}>
        <StyledCloseButton
          onClick={() => {
            setShowQRCode(false);
          }}
        >
          <CloseIcon />
        </StyledCloseButton>
        <div ref={ref} />
        <Spacer height={24} />
        <StyledUsernameText>{username}</StyledUsernameText>
        <StyledHelperText>Scan to open {username}'s gallery in a new browser tab.</StyledHelperText>
      </StyledFullScreenQR>
      <StyledToggleButton onClick={handleClick} title="Open QR code">
        <QRIcon />
      </StyledToggleButton>
    </>
  );
}

const StyledToggleButton = styled.button`
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

const StyledFullScreenQR = styled.div<{ showQRCode: boolean }>`
  pointer-events: ${({ showQRCode }) => (showQRCode ? 'all' : 'none')};
  opacity: ${({ showQRCode }) => (showQRCode ? 1 : 0)};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 10;

  display: flex;
  flex-direction: column;
  justify-content: center;
  place-items: center;

  transition: opacity 400ms ease;
`;

const StyledCloseButton = styled.button`
  position: absolute;
  top: 27px;
  right: 27px;
  font-size: 1rem;

  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
`;

const StyledUsernameText = styled.p`
  font-family: GT Alpina;
  font-size: 24px;
  font-weight: 300;
  line-height: 28px;
  letter-spacing: -0.04em;
  text-align: left;
`;

const StyledHelperText = styled.p`
  font-family: ABC Diatype;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0px;
  text-align: center;
  position: absolute;
  bottom: 32px;
`;

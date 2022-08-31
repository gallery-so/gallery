import Spacer from 'components/core/Spacer/Spacer';
import { BaseM, TitleM } from 'components/core/Text/Text';
import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import QRCodeStyling from 'qr-code-styling';

export function useQrCode() {
  return new QRCodeStyling({
    width: 636, // 4 * 159px
    height: 636, // 4 * 159px
    image: gLogoBase64,
    data: 'https://gallery.so/',
    margin: 0,
    qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
    imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
    dotsOptions: { type: 'square', color: '#000000', gradient: undefined },
    backgroundOptions: { color: '#ffffff', gradient: undefined },
    // @ts-expect-error A bunch of these types are missing?
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
    cornersSquareOptions: { color: '#000000' },
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
    cornersDotOptions: { color: '#000000' },
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
}

const gLogoBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJcAAACWCAYAAADTwxrcAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVNSURBVHgB7d3dUSNHFIbhA4hrY0D3IgJrI7CIwOsIFkdgNgIgAnsjgI0AE8EOGeAIVr6GC90Dwt8RzZYWj3qEdmZx9XmfKpVAM0hU6avunp7+MQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQtjXDQluyubk50I/Dh4eHLX8pHZro9/H6+vr4+vr6ylCLcD3jger1er/rx1F6NJnoUa2trV0oaGd1J2xvbx8qiLNg3t3dnU0mk7EFQLiS3d3dkZ6ObLlA1Uql2cl8yJTVgcL6ee60/Zubm8oCWLfgvKRSsP7Qj58sEyyVTGM9VenhVeGk5pyBAna6s7Pzud/vH/hrCtsvFlTokku5Gm5sbJx7KBacUulxoqrsSlXZpO7v1SYbTqfTo8x7PBem5AobLpUu7xSIswWHKwXqvfK0dGPdSyqVWl4CbjWcSrVYslyw9PoHffn7LwmW83aWAvnG212GmXDhUrDeZkosb4wf2or8KvD+/n7fatpjEYUKl1+5KVinCw5XKrGO7RulboZfDbHCpca7XxHWtolUpf1mLfE2larHjxZcmHCpuyF3RXfSdsemqsdjCy5EuLw6VElyUHfMG+Dea24tS2GtLLAQ4VJ1eJzry+rwdsyJBVZ8uFIj/t2i46q+OguAd75a4CvH4sOlHvRR5vBVlzeRU69+2FETxYfLb80sOqYS7dI6pjbd3xZU0eHykQ65e3764v+y7lUWVNHhUnje5o6nNlGn1KYLWy32rGAqtX7OHK4d6dCB2WDCp1/0P4Vp4BcbLh+npadh5pR/7DtIAd63gIqtFnu93rDhFMa+d6zkNtcodzCNLEWHig2XGvPDhuNjQ6eKDZdKph8Mr6rkajFbcqkbYmzoVMnhahrLjo4VGa7UDZEVZWLqayq1n6vVUivNwj63DvgI2FKDXnQPfYs8rCPDi4SfcY3uUHItwast1Yx76VevIr9Uu2kK/0A/+n3M0bJvaY8zuauS235FzriuWfzjP/TF/tj2jWv/XJ9h1DS1X5+9F+GCoshqcckvrvWuCv9cBatpitpFlCvVkttcrzK0xecsNty3rCyIkm//ZMOlanNgHZlOpwuHT/tqhBZEseHSF5wdu/6CJY9apf8rzGDBkqvFce5gWuMUHSo2XKp+soMBFa6fDJ0qNly3t7fZcKlabBqpim9UbLjS4m259s3A0KnSp5blJr1u9ft9Sq8OFR0utbuyk14VvpF1g5UFrfBwqd3l4cp90Z0s4x1pbmJO0eHye4cNVeNwmYGFWE3xQ25UivyZOewjHA4MnSg+XGnN9ypzStgdLroWZbBgboG3Udr3pzX0/j8KEa60uvKHzClH1i5KQws0zNlXV87MsvbS69Ba0LQmWCRhwuVXjg0D+Y7a6FT1XcsMM6EmaKTG/fsFh7em0+m5D1W2Fc2vde+lZPSNDsLN/lHAvGuitoHvwfAx8Ks08H2zKj0dz73XR90hqCywkFPL0h4/XoLVbsipp08Ky+kypZh3wurcs/nNqrzU8s9Y4g5B0aJv5rnMbJ1Kj0sF5urpto6fryp0qGcfEzaaP9mD5TuXPU3CUCn4fAfaMPsthp63mAKw5xtxZnZ7HflDx768oADZ/O9zr38VLKf3vVD1OLKAmHFtjxtxKhRv0tXkKstZzia5+ns8nzamcH2P5cj/l0JXi4t4dek7b6gk8s7Qp4V7v+p19+ljCk6lUunS21a5Cba+gajOm/29zi16ljUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC34F9wnFUw4gXCoAAAAAElFTkSuQmCC';

export default function QRCodePopover({
  username,
  styledQrCode,
}: {
  username: string;
  styledQrCode: QRCodeStyling;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update the QR code with the profile url, then append it to the ref.
    // Without calling update(), the appended QR code does not consistently display the logo image upon initial render. (especially on mobile)
    // This is likely because it is painted before the image has finished loading.
    // Calling update() refreshes the canvas content, which fixes the issue.
    styledQrCode.update({ data: `https://gallery.so/${username}` });
    styledQrCode.append(ref.current ?? undefined);
  }, [styledQrCode, username]);

  return (
    <StyledQRCodePopover>
      <StyledQRCode ref={ref} />
      <Spacer height={24} />
      <TitleM>
        <strong>{username}</strong>
      </TitleM>
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

const StyledQRCode = styled.div`
  height: 159px;
  width: 159px;
  transform: scale(0.25);
  display: flex;
  justify-content: center;
  place-items: center;
`;

const StyledBaseM = styled(BaseM)`
  text-align: center;
  position: absolute;
  bottom: 32px;
`;

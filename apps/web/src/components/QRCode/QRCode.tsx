import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';

type Props = {
  width: number;
  height: number;
  encodedData: string;
};

export default function QRCode({ width, height, encodedData }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    // importing this library via ES modules throws a nasty error: https://github.com/kozakdenys/qr-code-styling/issues/172
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const QRCodeStyling = require('qr-code-styling');
    const qrCode = new QRCodeStyling({
      // multiply dimensions by 4 for canvas
      width: width * 4,
      height: height * 4,
      image: gLogoBase64,
      data: encodedData,
      margin: 0,
      qrOptions: { typeNumber: 0, mode: 'Byte', errorCorrectionLevel: 'Q' },
      imageOptions: { hideBackgroundDots: true, imageSize: 0.4, margin: 0 },
      dotsOptions: { type: 'square', color: '#000000' },
      backgroundOptions: { color: '#ffffff' },
      cornersSquareOptions: { type: 'square', color: '#000000' },
      cornersDotOptions: { type: 'square', color: '#000000' },
    });

    // Update the QR code with the updated data, then append it to the ref.
    // Without calling update(), the appended QR code does not consistently display the logo image upon initial render. (especially on mobile)
    // This is likely because it is painted before the image has finished loading.
    // Calling update() refreshes the canvas content, which fixes the issue.
    const timeoutId = setTimeout(() => {
      if (ref.current) {
        ref.current.innerHTML = '';
        qrCode.update({ data: encodedData });
        qrCode.append(ref.current);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [encodedData, height, width]);

  return <StyledQRCode ref={ref} width={width} height={height} />;
}

const StyledQRCode = styled.div<Partial<Props>>`
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
  transform: scale(0.25);
  display: flex;
  justify-content: center;
  place-items: center;
`;

const gLogoBase64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJcAAACWCAYAAADTwxrcAAAACXBIWXMAABCcAAAQnAEmzTo0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVNSURBVHgB7d3dUSNHFIbhA4hrY0D3IgJrI7CIwOsIFkdgNgIgAnsjgI0AE8EOGeAIVr6GC90Dwt8RzZYWj3qEdmZx9XmfKpVAM0hU6avunp7+MQMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQtjXDQluyubk50I/Dh4eHLX8pHZro9/H6+vr4+vr6ylCLcD3jger1er/rx1F6NJnoUa2trV0oaGd1J2xvbx8qiLNg3t3dnU0mk7EFQLiS3d3dkZ6ObLlA1Uql2cl8yJTVgcL6ee60/Zubm8oCWLfgvKRSsP7Qj58sEyyVTGM9VenhVeGk5pyBAna6s7Pzud/vH/hrCtsvFlTokku5Gm5sbJx7KBacUulxoqrsSlXZpO7v1SYbTqfTo8x7PBem5AobLpUu7xSIswWHKwXqvfK0dGPdSyqVWl4CbjWcSrVYslyw9PoHffn7LwmW83aWAvnG212GmXDhUrDeZkosb4wf2or8KvD+/n7fatpjEYUKl1+5KVinCw5XKrGO7RulboZfDbHCpca7XxHWtolUpf1mLfE2larHjxZcmHCpuyF3RXfSdsemqsdjCy5EuLw6VElyUHfMG+Dea24tS2GtLLAQ4VJ1eJzry+rwdsyJBVZ8uFIj/t2i46q+OguAd75a4CvH4sOlHvRR5vBVlzeRU69+2FETxYfLb80sOqYS7dI6pjbd3xZU0eHykQ65e3764v+y7lUWVNHhUnje5o6nNlGn1KYLWy32rGAqtX7OHK4d6dCB2WDCp1/0P4Vp4BcbLh+npadh5pR/7DtIAd63gIqtFnu93rDhFMa+d6zkNtcodzCNLEWHig2XGvPDhuNjQ6eKDZdKph8Mr6rkajFbcqkbYmzoVMnhahrLjo4VGa7UDZEVZWLqayq1n6vVUivNwj63DvgI2FKDXnQPfYs8rCPDi4SfcY3uUHItwast1Yx76VevIr9Uu2kK/0A/+n3M0bJvaY8zuauS235FzriuWfzjP/TF/tj2jWv/XJ9h1DS1X5+9F+GCoshqcckvrvWuCv9cBatpitpFlCvVkttcrzK0xecsNty3rCyIkm//ZMOlanNgHZlOpwuHT/tqhBZEseHSF5wdu/6CJY9apf8rzGDBkqvFce5gWuMUHSo2XKp+soMBFa6fDJ0qNly3t7fZcKlabBqpim9UbLjS4m259s3A0KnSp5blJr1u9ft9Sq8OFR0utbuyk14VvpF1g5UFrfBwqd3l4cp90Z0s4x1pbmJO0eHye4cNVeNwmYGFWE3xQ25UivyZOewjHA4MnSg+XGnN9ypzStgdLroWZbBgboG3Udr3pzX0/j8KEa60uvKHzClH1i5KQws0zNlXV87MsvbS69Ba0LQmWCRhwuVXjg0D+Y7a6FT1XcsMM6EmaKTG/fsFh7em0+m5D1W2Fc2vde+lZPSNDsLN/lHAvGuitoHvwfAx8Ks08H2zKj0dz73XR90hqCywkFPL0h4/XoLVbsipp08Ky+kypZh3wurcs/nNqrzU8s9Y4g5B0aJv5rnMbJ1Kj0sF5urpto6fryp0qGcfEzaaP9mD5TuXPU3CUCn4fAfaMPsthp63mAKw5xtxZnZ7HflDx768oADZ/O9zr38VLKf3vVD1OLKAmHFtjxtxKhRv0tXkKstZzia5+ns8nzamcH2P5cj/l0JXi4t4dek7b6gk8s7Qp4V7v+p19+ljCk6lUunS21a5Cba+gajOm/29zi16ljUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC34F9wnFUw4gXCoAAAAAElFTkSuQmCC';

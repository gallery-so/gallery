import colors from 'components/core/colors';
import styled from 'styled-components';

import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';

export default function LinkButton({ textToCopy }: { textToCopy: string }) {
  return (
    <CopyToClipboard textToCopy={textToCopy} successText={'Copied link to clipboard'}>
      <StyledButton>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 7H6C4.67392 7 3.40215 7.52678 2.46447 8.46447C1.52678 9.40215 1 10.6739 1 12C1 13.3261 1.52678 14.5979 2.46447 15.5355C3.40215 16.4732 4.67392 17 6 17H8"
            stroke="black"
          />
          <path d="M7 12H17" stroke="black" />
          <path
            d="M16 17H18C19.3261 17 20.5979 16.4732 21.5355 15.5355C22.4732 14.5979 23 13.3261 23 12C23 10.6739 22.4732 9.40215 21.5355 8.46447C20.5979 7.52678 19.3261 7 18 7H16"
            stroke="black"
          />
        </svg>
      </StyledButton>
    </CopyToClipboard>
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

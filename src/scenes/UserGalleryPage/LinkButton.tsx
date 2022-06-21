import colors from 'components/core/colors';
import styled from 'styled-components';

import CopyToClipboard from 'components/CopyToClipboard/CopyToClipboard';
import LinkIcon from 'src/icons/LinkIcon';

export default function LinkButton({ textToCopy }: { textToCopy: string }) {
  return (
    <CopyToClipboard textToCopy={textToCopy} successText={'Copied link to clipboard'}>
      <StyledButton>
        <LinkIcon />
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

import styled from 'styled-components';

import CopyToClipboard from '~/components/CopyToClipboard/CopyToClipboard';
import LinkIcon from '~/icons/LinkIcon';
import colors from '~/shared/theme/colors';

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

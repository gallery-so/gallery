import { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { useToastActions } from 'contexts/toast/ToastContext';

type Props = {
  textToCopy: string;
  children: ReactNode;
  successText?: string;
};

export default function CopyToClipboard({
  textToCopy,
  children,
  successText = 'Copied link to clipboard',
}: Props) {
  const { pushToast } = useToastActions();

  const handleCopyToClipboard = useCallback(async () => {
    void navigator.clipboard.writeText(textToCopy);
    pushToast({ message: successText, autoClose: true });
  }, [textToCopy, pushToast, successText]);

  return <Container onClick={handleCopyToClipboard}>{children}</Container>;
}

const Container = styled.span`
  display: flex;
`;

import {
  ClipboardEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { SendButton } from '~/components/Feed/Socialize/SendButton';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { CommentBoxQueryFragment$key } from '~/generated/CommentBoxQueryFragment.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import colors from '~/shared/theme/colors';

const MAX_TEXT_LENGTH = 300;

type Props = {
  queryRef: CommentBoxQueryFragment$key;
  onSubmitComment: (comment: string) => void;
  isSubmittingComment: boolean;
};

export function CommentBox({ queryRef, onSubmitComment, isSubmittingComment }: Props) {
  const query = useFragment(
    graphql`
      fragment CommentBoxQueryFragment on Query {
        viewer {
          __typename
        }
        ...useAuthModalFragment
      }
    `,
    queryRef
  );

  // WARNING: calling `setValue` will not cause the textarea's content to actually change
  // It's simply there as a state value that we can reference to peek into the current state
  // of the textarea.
  //
  // We don't flush the state of `value` back out to the textarea to avoid constantly having
  // to move the user's cursor around while their typing. This would cause a pretty jarring
  // typing experience.
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLParagraphElement | null>(null);

  const { pushToast } = useToastActions();

  const track = useTrack();
  const { showModal } = useModalActions();

  const resetInputState = useCallback(() => {
    setValue('');

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.innerText = '';
    }
  }, []);

  const pushErrorToast = useCallback(() => {
    pushToast({
      autoClose: true,
      message: "Something went wrong while posting your comment. We're looking into it.",
    });
  }, [pushToast]);

  const handleSubmit = useCallback(async () => {
    if (query.viewer?.__typename !== 'Viewer') {
      showModal({
        content: <AuthModal queryRef={query} />,
        headerText: 'Sign In',
      });

      return;
    }

    if (isSubmittingComment || value.length === 0) {
      return;
    }

    track('Save Comment Click');

    try {
      onSubmitComment(value);
    } catch (error) {
      pushErrorToast();
      return;
    }
    resetInputState();
  }, [
    query,
    isSubmittingComment,
    value,
    track,
    resetInputState,
    showModal,
    onSubmitComment,
    pushErrorToast,
  ]);

  const handleInputKeyDown = useCallback<KeyboardEventHandler>(
    async (event) => {
      /* To disable formatting, manually handling shortcuts might be the most straightforward approach. 
        While it can be a bit verbose, it ensures that we have full control over what formatting shortcuts 
        are allowed. 
      */
      if (
        (event.ctrlKey || event.metaKey) && // Ctrl or Cmd
        ['b', 'i', 'u', 's'].includes(event.key)
      ) {
        event.preventDefault(); // Prevent formatting
      }
      if (event.key === 'Enter' && event.metaKey) {
        await handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const nextValue = textarea.innerText ?? '';

    // If the user tried typing / pasting something over 100 characters of length
    // we need to trim the content down, override the text content in the element
    // and then put their cursor back at the end of the element
    if (nextValue.length > MAX_TEXT_LENGTH) {
      const nextValueSliced = nextValue.slice(0, MAX_TEXT_LENGTH);
      textarea.textContent = nextValueSliced;

      const range = document.createRange();
      const selection = window.getSelection();

      // Not really sure why `selection` is nullable
      // Maybe because other browsers don't support this API
      if (!selection) {
        return;
      }

      const childNode = textarea.childNodes[0];

      // There should only ever be a single child node
      if (!childNode) {
        return;
      }

      range.setStart(childNode, MAX_TEXT_LENGTH);
      range.setEnd(childNode, MAX_TEXT_LENGTH);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);

      setValue(nextValueSliced);
    } else {
      setValue(nextValue);
    }
  }, []);

  // This prevents someone from pasting a styled element into the textbox
  const handlePaste = useCallback<ClipboardEventHandler<HTMLParagraphElement>>(
    (event) => {
      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');

      // This is deprecated but will work forever because browsers
      document.execCommand('insertHTML', false, text);

      handleInput();
    },
    [handleInput]
  );

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <Wrapper>
      <InputWrapper gap={12}>
        {/* Purposely not using a controlled input here to avoid cursor jitter */}
        <Textarea
          onPaste={handlePaste}
          onKeyDown={handleInputKeyDown}
          ref={textareaRef}
          onInput={handleInput}
        />

        <HStack gap={12} align="center">
          <BaseM color={colors.metal}>{MAX_TEXT_LENGTH - value.length}</BaseM>
          <SendButton enabled={value.length > 0 && !isSubmittingComment} onClick={handleSubmit} />
        </HStack>
      </InputWrapper>
    </Wrapper>
  );
}

const InputWrapper = styled(HStack)`
  width: 100%;
  height: 100%;

  max-height: 150px;
  overflow-y: auto;

  ::-webkit-scrollbar {
    display: none;
  }

  padding: 0 8px;

  background-color: ${colors.faint};
`;

const Textarea = styled(BaseM).attrs({
  role: 'textbox',
  contentEditable: 'true',
})`
  min-width: 0;
  font-family: ${BODY_FONT_FAMILY};

  cursor: text;

  width: 100%;
  min-height: 20px;

  resize: both;

  color: ${colors.metal};

  padding: 8px 64px 8px 0;

  :focus {
    outline: none;
    color: ${colors.black['800']};
  }
`;

const Wrapper = styled.div`
  // Full width with 16px of padding on either side
  width: 100%;

  border-top: 1px solid ${colors.porcelain};

  background: ${colors.white};

  padding: 16px;
`;

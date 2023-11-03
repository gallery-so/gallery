import {
  autoUpdate,
  flip,
  FloatingPortal,
  inline,
  shift,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ClipboardEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import {
  ANIMATED_COMPONENT_TRANSITION_S,
  ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL,
  rawTransitions,
} from '~/components/core/transitions';
import { SendButton } from '~/components/Feed/Socialize/SendButton';
import { MentionModal } from '~/components/Mention/MentionModal';
import { useModalActions } from '~/contexts/modal/ModalContext';
import { useToastActions } from '~/contexts/toast/ToastContext';
import { CommentBoxQueryFragment$key } from '~/generated/CommentBoxQueryFragment.graphql';
import { MentionInput } from '~/generated/useCommentOnPostMutation.graphql';
import { AuthModal } from '~/hooks/useAuthModal';
import { contexts } from '~/shared/analytics/constants';
import { useTrack } from '~/shared/contexts/AnalyticsContext';
import { MentionType, useMentionableMessage } from '~/shared/hooks/useMentionableMessage';
import colors from '~/shared/theme/colors';

const MAX_TEXT_LENGTH = 300;

type Props = {
  queryRef: CommentBoxQueryFragment$key;
  onSubmitComment: (comment: string, mentions: MentionInput[]) => void;
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

  const {
    isSelectingMentions,
    aliasKeyword,
    selectMention,
    mentions,
    setMessage,
    message,
    resetMentions,
    handleSelectionChange,
  } = useMentionableMessage();

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: 'bottom-start',
    open: isSelectingMentions,
    middleware: [flip(), shift(), inline()],
    whileElementsMounted: autoUpdate,
  });

  const headingId = useId();
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([role]);

  // WARNING: calling `setValue` will not cause the textarea's content to actually change
  // It's simply there as a state value that we can reference to peek into the current state
  // of the textarea.
  //
  // We don't flush the state of `value` back out to the textarea to avoid constantly having
  // to move the user's cursor around while their typing. This would cause a pretty jarring
  // typing experience.
  // const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLParagraphElement | null>(null);

  const { pushToast } = useToastActions();

  const track = useTrack();
  const { showModal } = useModalActions();

  const resetInputState = useCallback(() => {
    resetMentions();

    const textarea = textareaRef.current;

    if (textarea) {
      textarea.innerText = '';
    }
  }, [resetMentions]);

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

    if (isSubmittingComment || message.length === 0) {
      return;
    }

    track('Save Comment Click', {
      id: 'Submit Comment Button',
      name: 'Submit Comment',
      context: contexts.Posts,
    });

    try {
      onSubmitComment(message, mentions);
    } catch (error) {
      pushErrorToast();
      return;
    }
    resetInputState();
  }, [
    query,
    isSubmittingComment,
    mentions,
    message,
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

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    const start = range.startOffset;
    const end = range.endOffset;

    handleSelectionChange({ start, end });

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

      // setValue(nextValueSliced);
      setMessage(nextValueSliced);
    } else {
      // setValue(nextValue);
      setMessage(nextValue);
    }
  }, [handleSelectionChange, setMessage]);

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

  const handleSelectMention = useCallback(
    (item: MentionType) => {
      selectMention(item);

      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
      }
    },
    [selectMention]
  );

  useEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.textContent = message;

      const range = document.createRange();
      const selection = window.getSelection();
      if (selection) {
        range.setStart(textarea.childNodes[0] || textarea, message.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textarea.focus();
    }
  }, [message]);

  return (
    <Wrapper>
      <InputWrapper gap={12} ref={reference}>
        {/* Purposely not using a controlled input here to avoid cursor jitter */}
        <Textarea
          onPaste={handlePaste}
          onKeyDown={handleInputKeyDown}
          ref={textareaRef}
          onInput={handleInput}
          {...getReferenceProps()}
        />

        <HStack gap={12} align="center">
          <BaseM color={colors.metal}>{MAX_TEXT_LENGTH - message.length}</BaseM>
          <SendButton enabled={message.length > 0 && !isSubmittingComment} onClick={handleSubmit} />
        </HStack>
      </InputWrapper>

      <AnimatePresence>
        {isSelectingMentions && (
          <FloatingPortal preserveTabOrder={false}>
            <StyledCardWrapper
              className="Popover"
              aria-labelledby={headingId}
              ref={floating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
              }}
              {...getFloatingProps()}
              transition={{
                duration: ANIMATED_COMPONENT_TRANSITION_S,
                ease: rawTransitions.cubicValues,
              }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: ANIMATED_COMPONENT_TRANSLATION_PIXELS_SMALL }}
              exit={{ opacity: 0, y: 0 }}
            >
              <MentionModal keyword={aliasKeyword} onSelectMention={handleSelectMention} />
            </StyledCardWrapper>
          </FloatingPortal>
        )}
      </AnimatePresence>
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

const StyledCardWrapper = styled(motion.div)`
  z-index: 11;

  :focus {
    outline: none;
  }
`;

import {
  autoUpdate,
  inline,
  shift,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence } from 'framer-motion';
import { KeyboardEventHandler, useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import styled from 'styled-components';

import { HStack } from '~/components/core/Spacer/Stack';
import { BaseM, BODY_FONT_FAMILY } from '~/components/core/Text/Text';
import { SendButton } from '~/components/Feed/Socialize/SendButton';
import { FloatingCard } from '~/components/Mention/FloatingCard';
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
import {
  getRemaningCharacterCount,
  MAX_COMMENT_LENGTH,
} from '~/shared/utils/getRemaningCharacterCount';

type Props = {
  queryRef: CommentBoxQueryFragment$key;
  onSubmitComment: (comment: string, mentions: MentionInput[], replyToId?: string) => void;
  isSubmittingComment: boolean;
  replyToId?: string;
};

export function CommentBox({ queryRef, onSubmitComment, isSubmittingComment, replyToId }: Props) {
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
    closeMention,
  } = useMentionableMessage();

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: 'bottom-start',
    open: isSelectingMentions,
    middleware: [shift(), inline()],
    whileElementsMounted: autoUpdate,
  });

  const headingId = useId();
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([role]);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const { pushToast } = useToastActions();

  const track = useTrack();
  const { showModal } = useModalActions();

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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
      onSubmitComment(message, mentions, replyToId);
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
    replyToId,
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

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(event.target.value);
    },
    [setMessage]
  );

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

  const handleOnSelect = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>) => {
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      handleSelectionChange({ start, end });
    },
    [handleSelectionChange]
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      const pastedText = event.clipboardData.getData('text/plain');
      const start = textareaRef.current?.selectionStart || 0;
      const end = textareaRef.current?.selectionEnd || 0;
      const newText = message.substring(0, start) + pastedText + message.substring(end);
      const newMessage =
        newText.length > MAX_COMMENT_LENGTH ? newText.substring(0, MAX_COMMENT_LENGTH) : newText;
      setMessage(newMessage);
    },
    [setMessage, message, textareaRef]
  );

  const characterLeft = useMemo(
    () => getRemaningCharacterCount(message, MAX_COMMENT_LENGTH),
    [message]
  );

  const isExceedingCharacterLimit = useMemo(() => {
    return characterLeft < 0;
  }, [characterLeft]);

  return (
    <Wrapper>
      <InputWrapper gap={12} ref={reference}>
        <StyledTextArea
          placeholder="Add a comment"
          onInput={handleChange}
          ref={textareaRef}
          value={message}
          onKeyDown={handleInputKeyDown}
          onSelect={handleOnSelect}
          onPaste={handlePaste}
          {...getReferenceProps()}
          autoFocus
        />

        <HStack gap={12} align="center">
          <BaseM color={colors.metal}>{characterLeft}</BaseM>
          <SendButton
            enabled={message.length > 0 && !isExceedingCharacterLimit && !isSubmittingComment}
            onClick={handleSubmit}
          />
        </HStack>
      </InputWrapper>

      <AnimatePresence>
        {isSelectingMentions && (
          <FloatingCard
            className="Popover"
            headingId={headingId}
            floatingRef={floating}
            strategy={strategy}
            x={x}
            y={y}
            getFloatingProps={getFloatingProps}
          >
            <MentionModal
              keyword={aliasKeyword}
              onSelectMention={handleSelectMention}
              onEmptyResultsClose={closeMention}
            />
          </FloatingCard>
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

const StyledTextArea = styled.textarea`
  font-family: ${BODY_FONT_FAMILY};

  color: ${colors.metal};

  padding: 8px 64px 8px 0;

  width: 100%;
  height: 36px;
  border: none;
  resize: none;
  font-size: 14px;
  line-height: 20px;
  background: none;
  color: ${colors.black['800']};

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
  margin-top: auto;
`;

import {
  autoUpdate,
  inline,
  shift,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { graphql, useFragment } from 'react-relay';
import colors from 'shared/theme/colors';
import { MAX_POST_LENGTH } from 'shared/utils/getRemaningCharacterCount';
import styled from 'styled-components';

import { usePostComposerContext } from '~/contexts/postComposer/PostComposerContext';
import { PostComposerTextAreaFragment$key } from '~/generated/PostComposerTextAreaFragment.graphql';
import { MentionType } from '~/shared/hooks/useMentionableMessage';

import { HStack, VStack } from '../core/Spacer/Stack';
import { BaseM } from '../core/Text/Text';
import { TextArea } from '../core/TextArea/TextArea';
import transitions from '../core/transitions';
import { FloatingCard } from '../Mention/FloatingCard';
import { MentionModal } from '../Mention/MentionModal';

type Props = {
  tokenRef: PostComposerTextAreaFragment$key;

  //   TODO: (jakz) in the future, convert this hook to a context
  isSelectingMentions: boolean;
  aliasKeyword: string;
  selectMention: (item: MentionType) => void;
  setMessage: (message: string) => void;
  message: string;
  handleSelectionChange: (selection: { start: number; end: number }) => void;
  closeMention: () => void;
};

export function PostComposerTextArea({
  tokenRef,
  isSelectingMentions,
  aliasKeyword,
  selectMention,
  setMessage,
  message,
  handleSelectionChange,
  closeMention,
}: Props) {
  const token = useFragment(
    graphql`
      fragment PostComposerTextAreaFragment on Token {
        definition {
          name
        }
      }
    `,
    tokenRef
  );

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

  const { caption } = usePostComposerContext();

  // if there is caption, set it as the default message
  // for the  share to gallery
  const prevCaption = useRef<string | null>(null);

  useEffect(() => {
    if (prevCaption.current !== caption) {
      prevCaption.current = caption;
      setMessage(caption);
      if (textareaRef.current) {
        const length = textareaRef.current.value.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(length, length);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caption]);

  const inputPlaceholderTokenName = useMemo(() => {
    if (!token.definition.name || token.definition.name.length > 30) {
      return 'this item';
    }
    return `"${token.definition.name}"`;
  }, [token.definition.name]);

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(event.target.value);
    },
    [setMessage]
  );

  const setRefs = useCallback(
    (node: HTMLTextAreaElement | null) => {
      // Ref's `current` property accepts a DOM node
      if (node) {
        textareaRef.current = node;
        reference(node);
      }
    },
    [reference]
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

  const showPreviewMaxCharacterReached = useMemo(
    () => message.length > MAX_POST_LENGTH - 100,
    [message.length]
  );

  return (
    <VStack>
      <VStack gap={8}>
        <StyledTextAreaWrapper>
          <TextArea
            placeholder={`Say something about ${inputPlaceholderTokenName}`}
            textAreaHeight="117px"
            onChange={handleDescriptionChange}
            autoFocus
            hasPadding
            value={message}
            ref={setRefs}
            onSelect={handleOnSelect}
            {...getReferenceProps()}
          />
        </StyledTextAreaWrapper>

        {showPreviewMaxCharacterReached && (
          <StyledErrorTextWrapper align="center" justify="space-between">
            <StyledMaxTextLengthWrapper hasError={message.length > MAX_POST_LENGTH}>
              <BaseM color={colors.red}>Max text length reached</BaseM>
            </StyledMaxTextLengthWrapper>
            <StyledCharacterCounter
              hasError={message.length > MAX_POST_LENGTH}
              showCharacterCount={showPreviewMaxCharacterReached}
            >
              {message.length}/{MAX_POST_LENGTH}
            </StyledCharacterCounter>
          </StyledErrorTextWrapper>
        )}
      </VStack>
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
    </VStack>
  );
}

const StyledCharacterCounter = styled(BaseM)<{ hasError: boolean; showCharacterCount: boolean }>`
  transition: opacity ${transitions.cubic};
  color: ${({ hasError }) => (hasError ? colors.red : colors.metal)};
  opacity: ${({ showCharacterCount }) => (showCharacterCount ? 1 : 0)};
`;

const StyledTextAreaWrapper = styled.div`
  position: relative;
  background-color: ${colors.faint};
  height: 117px;
`;

const StyledMaxTextLengthWrapper = styled.div<{ hasError: boolean }>`
  transition: all ${transitions.cubic};
  opacity: ${({ hasError }) => (hasError ? 1 : 0)};
  transition: opacity ${transitions.cubic};
`;

const StyledErrorTextWrapper = styled(HStack)`
  padding-bottom: 8px;
`;

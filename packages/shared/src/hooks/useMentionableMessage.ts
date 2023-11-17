import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';
import { useCallback, useMemo, useState } from 'react';

import { WHITESPACE_REGEX } from '../utils/regex';
import useDebounce from './useDebounce';

export type MentionDataType = {
  interval: {
    start: number;
    length: number;
  };
  userId?: string;
  communityId?: string;
  label?: string;
};

export type MentionType = {
  type: 'User' | 'Community';
  label: string;
  value: string;
};

export function useMentionableMessage() {
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<MentionDataType[]>([]);

  const [isSelectingMentions, setIsSelectingMentions] = useState(false);

  const [aliasKeyword, setAliasKeyword] = useState('');
  const debouncedAliasKeyword = useDebounce(aliasKeyword, 100);

  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const handleSetMention = useCallback(
    (mention: MentionType) => {
      // Use substring to only look up to the current cursor position
      const upToCursor = message.substring(0, selection.start);
      const mentionStartPos = upToCursor.lastIndexOf(aliasKeyword);
      const mentionEndPos = mentionStartPos + aliasKeyword.length;

      const newMessage = `${message.substring(0, mentionStartPos)}@${
        mention.label
      } ${message.substring(mentionEndPos)}`;

      setMessage(newMessage);

      const newMention: MentionDataType = {
        interval: {
          start: mentionStartPos,
          length: mention.label.length + 1, // +1 for the @
        },
        label: mention.label,
      };

      if (mention.type === 'User') {
        newMention.userId = mention.value;
      } else {
        newMention.communityId = mention.value;
      }

      setIsSelectingMentions(false);

      const updatedMentions = updateMentionPositions(newMessage, [...mentions, newMention]);

      setMentions(updatedMentions);

      setAliasKeyword('');

      return newMessage;
    },
    [mentions, message, setMessage, aliasKeyword, selection.start]
  );

  const handleSetMessage = useCallback(
    (text: string) => {
      // Check the word where the cursor is (or was last placed)
      const wordAtCursor = text
        .slice(0, selection.start + 1)
        .split(WHITESPACE_REGEX)
        .pop();

      if (wordAtCursor && wordAtCursor[0] === '@' && wordAtCursor.length > 0) {
        setIsSelectingMentions(true);
      } else {
        setAliasKeyword('');
        setIsSelectingMentions(false);
      }

      if (wordAtCursor && wordAtCursor?.length > 1) {
        setAliasKeyword(wordAtCursor);
      }

      const updatedMentions = updateMentionPositions(text, mentions);

      setMentions(updatedMentions);
      setMessage(text);
    },
    [mentions, selection]
  );

  const resetMentions = useCallback(() => {
    setMentions([]);
    setIsSelectingMentions(false);
    setMessage('');
    setAliasKeyword('');
  }, []);

  const handleSelectionChange = useCallback((selection: { start: number; end: number }) => {
    setSelection(selection);
  }, []);

  const handleClosingMention = useCallback(() => {
    setIsSelectingMentions(false);
    setAliasKeyword('');
  }, []);

  const internalMentions = useMemo(() => {
    return mentions.map((mention) => {
      const { label, ...rest } = mention;
      return rest;
    });
  }, [mentions]);

  return {
    aliasKeyword: debouncedAliasKeyword,
    isSelectingMentions,
    message,
    setMessage: handleSetMessage,
    selectMention: handleSetMention,
    mentions: internalMentions || [],
    resetMentions,
    handleSelectionChange,
    selection,
    closeMention: handleClosingMention,
  };
}

export function updateMentionPositions(text: string, mentions: MentionDataType[]) {
  const updatedMentions: MentionDataType[] = [];
  mentions.forEach((mention) => {
    // use regex to find all mentions in text
    const regex = new RegExp(`@${mention.label}`, 'g');
    let matches;

    while ((matches = regex.exec(text))) {
      const label = mention?.label || '';
      updatedMentions.push({
        ...mention,
        interval: {
          start: matches.index || 0,
          length: label.length + 1, // +1 for the @
        },
      });
    }
  });

  return uniqWith(updatedMentions, isEqual);
}

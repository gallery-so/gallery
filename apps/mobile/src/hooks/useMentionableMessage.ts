import { useCallback, useState } from 'react';
import { graphql, useFragment } from 'react-relay';
import isFeatureEnabled, { FeatureFlag } from 'src/utils/isFeatureEnabled';

import { useMentionableMessageQueryFragment$key } from '~/generated/useMentionableMessageQueryFragment.graphql';
import useDebounce from '~/shared/hooks/useDebounce';

type MentionDataType = {
  interval: {
    start: number;
    length: number;
  };
  userId?: string;
  communityId?: string;
};

export type MentionType = {
  type: 'User' | 'Community';
  label: string;
  value: string;
};

type Mention = {
  interval: {
    start: number;
    length: number;
  };
  userId?: string;
  communityId?: string;
};

export function useMentionableMessage(queryRef: useMentionableMessageQueryFragment$key) {
  const query = useFragment(
    graphql`
      fragment useMentionableMessageQueryFragment on Query {
        ...isFeatureEnabledFragment
      }
    `,
    queryRef
  );

  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<MentionDataType[]>([]);

  const [isSelectingMentions, setIsSelectingMentions] = useState(false);

  const [aliasKeyword, setAliasKeyword] = useState('');
  const debouncedAliasKeyword = useDebounce(aliasKeyword, 100);

  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const isMentionEnabled = isFeatureEnabled(FeatureFlag.MENTIONS, query);

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

      const newMention: Mention = {
        interval: {
          start: mentionStartPos,
          length: mention.label.length + 1, // +1 for the @
        },
      };

      if (mention.type === 'User') {
        newMention.userId = mention.value;
      } else {
        newMention.communityId = mention.value;
      }

      // Calculate the length difference between the old alias and the new mention
      const lengthDifference = mention.label.length + 2 - aliasKeyword.length; // +1 for the @

      // Adjust the positions of mentions that come after the newly added mention
      const adjustedMentions = mentions.map((existingMention) => {
        if (existingMention.interval.start >= mentionStartPos) {
          return {
            ...existingMention,
            interval: {
              start: existingMention.interval.start + lengthDifference,
              length: existingMention.interval.length,
            },
          };
        }
        return existingMention;
      });

      setIsSelectingMentions(false);

      setMentions([...adjustedMentions, newMention]);
    },
    [mentions, message, setMessage, aliasKeyword, selection.start]
  );

  const handleSetMessage = useCallback(
    (text: string) => {
      if (!isMentionEnabled) {
        setMessage(text);
        return;
      }

      // Check the word where the cursor is (or was last placed)
      const wordAtCursor = text
        .slice(0, selection.start + 1)
        .split(' ')
        .pop();

      if (wordAtCursor && wordAtCursor[0] === '@' && wordAtCursor.length > 1) {
        setAliasKeyword(wordAtCursor);
        setIsSelectingMentions(true);
      } else {
        setAliasKeyword('');
        setIsSelectingMentions(false);
      }

      // Determine how many characters were added or removed
      const diff = message.length - text.length;

      // Update the positions of the mentions based on the added/removed characters
      let updatedMentions = mentions.map((mention) => {
        // If the change occurred before a mention, adjust its position
        if (mention.interval.start >= selection.start) {
          return {
            ...mention,
            interval: {
              ...mention.interval,
              start: mention.interval.start - diff,
            },
          };
        }
        return mention;
      });

      // Remove any mentions that were deleted
      updatedMentions = updatedMentions.filter((mention) => {
        // if start < 0, it means the mention was deleted
        return (
          mention.interval.start >= 0 &&
          mention.interval.start + mention.interval.length <= text.length
        );
      });

      setMentions(updatedMentions);
      setMessage(text);
    },
    [isMentionEnabled, mentions, message, selection]
  );

  const resetMentions = useCallback(() => {
    setMentions([]);
    setIsSelectingMentions(false);
    setMessage('');
  }, []);

  const handleSelectionChange = useCallback((selection: { start: number; end: number }) => {
    setSelection(selection);
  }, []);

  return {
    aliasKeyword: debouncedAliasKeyword,
    isSelectingMentions,
    message,
    setMessage: handleSetMessage,
    selectMention: handleSetMention,
    mentions: mentions || [],
    resetMentions,
    handleSelectionChange,
  };
}

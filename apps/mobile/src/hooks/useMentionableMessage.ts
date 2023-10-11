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

  const isMentionEnabled = isFeatureEnabled(FeatureFlag.MENTIONS, query);

  const handleSetMention = useCallback(
    (mention: MentionType) => {
      // get the last word
      const splitText = message.split(' ');
      const lastWord = splitText[splitText.length - 1] || '';

      // replace the last word with the mention
      const mentionStartPos = message.length - lastWord.length;
      const newMessage = `${message.substring(0, mentionStartPos)}@${
        mention.label
      } ${message.substring(mentionStartPos + lastWord.length)}`;

      // update the message
      setMessage(newMessage);
      setIsSelectingMentions(false);

      const newMention: Mention = {
        interval: {
          start: message.length - lastWord.length,
          length: mention.label.length + 1, // +1 for the @
        },
      };

      if (mention.type === 'User') {
        newMention.userId = mention.value;
      } else {
        newMention.communityId = mention.value;
      }

      const isOverlapping = (mention: Mention) => {
        return mentions.some((existingMention) => {
          return (
            mention.interval.start >= existingMention.interval.start &&
            mention.interval.start <=
              existingMention.interval.start + existingMention.interval.length
          );
        });
      };

      // add the mention to the list
      if (!isOverlapping(newMention)) {
        setMentions((prevMentions) => [...prevMentions, newMention]);
      }
    },
    [message, setMessage]
  );

  const handleSetMessage = useCallback(
    (text: string) => {
      if (!isMentionEnabled) {
        setMessage(text);
        return;
      }

      const splitText = text.split(' ');

      const lastWord = splitText[splitText.length - 1] || '';

      if (lastWord[0] === '@' && lastWord.length > 1) {
        setAliasKeyword(lastWord);
        setIsSelectingMentions(true);
      } else {
        setAliasKeyword('');
        setIsSelectingMentions(false);
      }

      // Loop through the mentions and check if they still exist in the updated message
      const updatedMentions = mentions.filter((mention) => {
        const mentionText = message.substring(
          mention.interval.start,
          mention.interval.start + mention.interval.length
        );
        return text.includes(mentionText) && text.indexOf(mentionText) === mention.interval.start;
      });

      setMentions(updatedMentions);

      setMessage(text);
    },
    [isMentionEnabled, mentions, message]
  );

  const resetMentions = useCallback(() => {
    setMentions([]);
    setIsSelectingMentions(false);
    setMessage('');
  }, []);

  return {
    aliasKeyword: debouncedAliasKeyword,
    isSelectingMentions,
    message,
    setMessage: handleSetMessage,
    selectMention: handleSetMention,
    mentions: mentions || [],
    resetMentions,
  };
}

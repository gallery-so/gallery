import { useCallback, useState } from 'react';

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

export function useMentionableMessage() {
  const [message, setMessage] = useState('');
  const [mentions, setMentions] = useState<MentionDataType[]>([]);

  const [isSelectingMentions, setIsSelectingMentions] = useState(false);

  const [aliasKeyword, setAliasKeyword] = useState('');
  const debouncedAliasKeyword = useDebounce(aliasKeyword, 100);

  const handleSetMention = useCallback(
    (mention: MentionType) => {
      // get the last word
      const splitText = message.split(' ');
      const lastWord = splitText[splitText.length - 1] || '';

      // replace the last word with the mention
      const newMessage = message.replace(lastWord, `@${mention.label} `);

      // update the message
      setMessage(newMessage);
      setIsSelectingMentions(false);

      // add the mention to the list
      setMentions((prevMentions) => [
        ...prevMentions,
        {
          interval: {
            start: message.length - lastWord.length,
            length: mention.label.length + 1, // +1 for the @
          },
          userId: mention.value,
          // communityId: mention.value,
          // communityId: '',
        },
      ]);
    },
    [message, setMessage]
  );

  const handleSetMessage = useCallback((text: string) => {
    const splitText = text.split(' ');

    const lastWord = splitText[splitText.length - 1] || '';

    if (lastWord[0] === '@' && lastWord.length > 1) {
      setAliasKeyword(lastWord);
      setIsSelectingMentions(true);
    } else {
      setAliasKeyword('');
      setIsSelectingMentions(false);
    }

    // Check if there is a mention inside it, if not, delete the mentions
    if (text.indexOf('@') === -1) {
      setMentions([]);
    }

    setMessage(text);
  }, []);

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

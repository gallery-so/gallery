import { createContext, memo, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import useDebounce from '~/shared/hooks/useDebounce';

export type MentionType = {
  type: 'User' | 'Community';
  label: string;
  value: string;
};

type MentionableMessageActions = {
  aliasKeyword: string;
  message: string;
  setMessage: (message: string) => void;
  parsedMessage: string;
  isSelectingMentions: boolean;

  selectMention: (mention: MentionType) => void;
};

const MentionableMessageActionsContext = createContext<MentionableMessageActions | undefined>(
  undefined
);

export const useMentionableMessageActions = (): MentionableMessageActions => {
  const context = useContext(MentionableMessageActionsContext);
  if (!context) {
    throw new Error('Attempted to use MentionableMessageActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const MentionableMessageProvider = memo(({ children }: Props) => {
  const [message, setMessage] = useState('');

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
    },
    [message, setMessage]
  );

  const parsedMessage = useMemo(() => {
    return message;
  }, [message]);

  const handleSetMessage = useCallback((text: string) => {
    const splitText = text.split(' ');

    const lastWord = splitText[splitText.length - 1] || '';

    if (lastWord[0] === '@') {
      setAliasKeyword(lastWord);
      setIsSelectingMentions(true);
    } else {
      setAliasKeyword('');
      setIsSelectingMentions(false);
    }

    setMessage(text);
  }, []);

  const value = useMemo(() => {
    return {
      aliasKeyword: debouncedAliasKeyword,
      isSelectingMentions,
      message,
      setMessage: handleSetMessage,
      parsedMessage,
      selectMention: handleSetMention,
    };
  }, [
    debouncedAliasKeyword,
    handleSetMention,
    handleSetMessage,
    isSelectingMentions,
    message,
    parsedMessage,
  ]);

  return (
    <MentionableMessageActionsContext.Provider value={value}>
      {children}
    </MentionableMessageActionsContext.Provider>
  );
});

MentionableMessageProvider.displayName = 'MentionableMessageProvider';

export default MentionableMessageProvider;

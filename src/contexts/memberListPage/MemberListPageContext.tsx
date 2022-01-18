import { createContext, memo, ReactNode, useContext, useMemo, useState } from "react";

export type MemberListPageState = {
  searchQuery: string;
  fadeUsernames: boolean;
}

export const MemberListPageContext = createContext<MemberListPageState | undefined>(
  undefined);

export const useMemberListPageState =  (): MemberListPageState => {
  const context = useContext(MemberListPageContext);
  if (!context) {
    throw new Error('Attempted to use MemberListPageContext without a provider');
  }

  return context;
}

type MemberListPageActions = {
  setSearchQuery: (searchQuery: string) => void;
  setFadeUsernames: (fadeUsernames: boolean) => void;
}

const MemberListPageActionsContext = createContext<MemberListPageActions | undefined>(undefined);

export const useMemberListPageActions = (): MemberListPageActions => {
  const context = useContext(MemberListPageActionsContext);
  if (!context) {
    throw new Error('Attempted to use MemberListPageActionsContext without a provider');
  }

  return context;
}

type Props = { children: ReactNode };

const MemberListPageProvider = memo(({ children }: Props) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fadeUsernames, setFadeUsernames] = useState<boolean>(false);

  const state = useMemo(() => ({
    searchQuery,
    fadeUsernames,
  }), [searchQuery, fadeUsernames]);

  const actions = useMemo(() => ({
    setSearchQuery,
    setFadeUsernames,
  }), [setSearchQuery, setFadeUsernames]);

  return (
    <MemberListPageContext.Provider value={state}>
      <MemberListPageActionsContext.Provider value={actions}>
        {children}
      </MemberListPageActionsContext.Provider>
    </MemberListPageContext.Provider>
  );
})

export default MemberListPageProvider;

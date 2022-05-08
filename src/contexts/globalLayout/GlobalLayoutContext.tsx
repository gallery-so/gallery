import { createContext, memo, ReactNode, useContext, useMemo, useState } from 'react';
import GlobalFooter from 'components/core/Page/GlobalFooter';
import GlobalNavbar from 'components/core/Page/GlobalNavbar/GlobalNavbar';
import { graphql } from 'relay-runtime';
import { useLazyLoadQuery } from 'react-relay';
import { GlobalLayoutContextQuery } from '__generated__/GlobalLayoutContextQuery.graphql';

type GlobalLayoutActions = {
  setNavbarVisible: (b: boolean) => void;
  setFooterVisible: (b: boolean) => void;
};

const GlobalLayoutActionsContext = createContext<GlobalLayoutActions | undefined>(undefined);

export const useGlobalLayoutActions = (): GlobalLayoutActions => {
  const context = useContext(GlobalLayoutActionsContext);
  if (!context) {
    throw new Error('Attempted to use GlobalLayoutActionsContext without a provider!');
  }

  return context;
};

type Props = { children: ReactNode };

const GlobalLayoutContextProvider = memo(({ children }: Props) => {
  const query = useLazyLoadQuery<GlobalLayoutContextQuery>(
    graphql`
      query GlobalLayoutContextQuery {
        ...GlobalNavbarFragment
      }
    `,
    {}
  );

  const [navbarVisible, setNavbarVisible] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  const actions: GlobalLayoutActions = useMemo(
    () => ({ setNavbarVisible, setFooterVisible }),
    [setNavbarVisible, setFooterVisible]
  );

  return (
    <>
      {/* TODO: handle banner */}
      {navbarVisible && <GlobalNavbar queryRef={query} />}
      <GlobalLayoutActionsContext.Provider value={actions}>
        {children}
      </GlobalLayoutActionsContext.Provider>
      {footerVisible && <GlobalFooter />}
    </>
  );
});

export default GlobalLayoutContextProvider;

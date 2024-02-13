import React, { createContext, memo, ReactNode, useContext, useMemo } from 'react';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

import { NftSelectorContextFragment$key } from '~/generated/NftSelectorContextFragment.graphql';
import { NftSelectorContextQuery } from '~/generated/NftSelectorContextQuery.graphql';
import { NftSelectorContextRefetchQuery } from '~/generated/NftSelectorContextRefetchQuery.graphql';
import { NftSelectorPickerGridFragment$key } from '~/generated/NftSelectorPickerGridFragment.graphql';

interface RefetchOptions {
  fetchPolicy?: 'store-or-network' | 'network-only';
  UNSTABLE_renderPolicy?: 'full' | 'partial';
}

interface NftSelectorActions {
  data: NftSelectorPickerGridFragment$key | null;
  refetch: (
    variables: NftSelectorContextRefetchQuery['variables'],
    options?: RefetchOptions
  ) => void;
}

export const NftSelectorContext = createContext<NftSelectorActions | undefined>(undefined);

export const useNftSelectorContext = () => {
  const context = useContext(NftSelectorContext);
  if (!context) {
    throw new Error('useNftSelectorContext must be used within a NftSelectorProvider');
  }
  return context;
};

type Props = { children: ReactNode };

const NftSelectorProvider = memo(({ children }: Props) => {
  const query = useLazyLoadQuery<NftSelectorContextQuery>(
    graphql`
      query NftSelectorContextQuery {
        ...NftSelectorContextFragment
      }
    `,
    {}
  );

  const [data, refetch] = useRefetchableFragment<
    NftSelectorContextRefetchQuery,
    NftSelectorContextFragment$key
  >(
    graphql`
      fragment NftSelectorContextFragment on Query
      @refetchable(queryName: "NftSelectorContextRefetchQuery") {
        ...NftSelectorPickerGridFragment
      }
    `,
    query
  );

  const value = useMemo(() => ({ data, refetch }), [data, refetch]);

  return <NftSelectorContext.Provider value={value}>{children}</NftSelectorContext.Provider>;
});

NftSelectorProvider.displayName = 'NftSelectorProvider';

export default NftSelectorProvider;

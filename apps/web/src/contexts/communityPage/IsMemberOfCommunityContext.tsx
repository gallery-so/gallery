import { createContext, ReactNode, useCallback, useContext } from 'react';
import { graphql, useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

import { IsMemberOfCommunityContextFragment$key } from '~/generated/IsMemberOfCommunityContextFragment.graphql';
import { IsMemberOfCommunityContextQuery } from '~/generated/IsMemberOfCommunityContextQuery.graphql';
import { IsMemberOfCommunityContextViewerQuery } from '~/generated/IsMemberOfCommunityContextViewerQuery.graphql';

type IsMemberOfCommunityState = {
  isMemberOfCommunity: boolean;
  refetchIsMemberOfCommunity: () => void;
};

export const IsMemberOfCommunityContext = createContext<IsMemberOfCommunityState | undefined>(
  undefined
);

export const useIsMemberOfCommunity = (): IsMemberOfCommunityState => {
  const context = useContext(IsMemberOfCommunityContext);
  if (!context) {
    throw new Error('Attempted to use IsMemberOfCommunityContext without a provider');
  }

  return context;
};

type IsMemberOfCommunityProviderProps = {
  children: ReactNode;
  communityDbid: string;
};

export const IsMemberOfCommunityProvider = ({
  children,
  communityDbid,
}: IsMemberOfCommunityProviderProps) => {
  const queryRef = useLazyLoadQuery<IsMemberOfCommunityContextQuery>(
    graphql`
      query IsMemberOfCommunityContextQuery($communityID: DBID!) {
        ...IsMemberOfCommunityContextFragment
      }
    `,
    {
      communityID: communityDbid,
    }
  );

  const [query, refetch] = useRefetchableFragment<
    IsMemberOfCommunityContextViewerQuery,
    IsMemberOfCommunityContextFragment$key
  >(
    graphql`
      fragment IsMemberOfCommunityContextFragment on Query
      @refetchable(queryName: "IsMemberOfCommunityContextViewerQuery") {
        viewer {
          ... on Viewer {
            user {
              __typename
              isMemberOfCommunity(communityID: $communityID)
            }
          }
        }
      }
    `,
    queryRef
  );

  const refetchIsMemberOfCommunity = useCallback(() => {
    refetch(
      {
        communityID: communityDbid,
      },
      { fetchPolicy: 'network-only' }
    );
  }, [communityDbid, refetch]);

  const isMemberOfCommunity = query?.viewer?.user?.isMemberOfCommunity ?? false;

  return (
    <IsMemberOfCommunityContext.Provider
      value={{ isMemberOfCommunity, refetchIsMemberOfCommunity }}
    >
      {children}
    </IsMemberOfCommunityContext.Provider>
  );
};

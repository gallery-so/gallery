import { useRouter } from 'next/router';
import {
  createContext,
  memo,
  MutableRefObject,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TokenFilterType } from '~/components/GalleryEditor/PiecesSidebar/SidebarViewSelector';
import { NftSelectorSortView } from '~/components/NftSelector/NftSelectorFilter/NftSelectorFilterSort';
import { Chain } from '~/shared/utils/chains';

type PostComposerState = {
  caption: string;
  setCaption: (s: string) => void;
  captionRef: MutableRefObject<string>;
  filterType: TokenFilterType;
  setFilterType: (s: TokenFilterType) => void;
  sortType: NftSelectorSortView;
  setSortType: (s: NftSelectorSortView) => void;
  network: Chain;
  setNetwork: (s: Chain) => void;
};

const PostComposerContext = createContext<PostComposerState | undefined>(undefined);

export const usePostComposerContext = (): PostComposerState => {
  const context = useContext(PostComposerContext);
  if (!context) {
    throw new Error('Attempted to use PostComposerContext without a provider!');
  }
  return context;
};

type Props = { children: ReactNode };

const PostComposerProvider = memo(({ children }: Props) => {
  const {
    query: {
      // optional pre-populated caption provided in URL params
      caption: queryCaption,
    },
  } = useRouter();

  const defaultCaption = useMemo(() => {
    if (typeof queryCaption === 'string') {
      return queryCaption;
    }
    return '';
  }, [queryCaption]);

  const [caption, setCaption] = useState(defaultCaption);

  const captionRef = useRef('');

  useEffect(() => {
    captionRef.current = caption;
  }, [caption]);

  const [filterType, setFilterType] = useState<TokenFilterType>('Collected');
  const [sortType, setSortType] = useState<NftSelectorSortView>('Recently added');
  const [network, setNetwork] = useState<Chain>('Ethereum');

  const value = useMemo(
    () => ({
      caption,
      setCaption,
      captionRef,
      filterType,
      setFilterType,
      sortType,
      setSortType,
      network,
      setNetwork,
    }),
    [caption, filterType, network, sortType]
  );

  return <PostComposerContext.Provider value={value}>{children}</PostComposerContext.Provider>;
});

PostComposerProvider.displayName = 'PostComposerProvider';

export default PostComposerProvider;

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
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { Chain, isSupportedChain } from '~/shared/utils/chains';

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
    /* eslint-disable @typescript-eslint/no-unused-vars */
    query: {
      composer,
      // required fields
      tokenId, // TODO: actually use this fallback
      contractAddress, // TODO: auto-select contract
      chain,
      // optional fields
      collection_title: collectionTitle, // TODO: actually use this fallback
      token_title: tokenTitle, // TODO: actually use this fallback
      image_url: imageUrl, // TODO: actually use this fallback
      caption: caption,
    },
  } = useRouter();

  const defaultCaption = useMemo(() => {
    if (typeof caption === 'string') {
      return caption;
    }
    return '';
  }, [caption]);

  const [_caption, setCaption] = useState(defaultCaption);

  const captionRef = useRef('');

  useEffect(() => {
    captionRef.current = _caption;
  }, [_caption]);

  // TODO: move selectedContract state / selector up into this context. will need to handle the edge
  // case where the contract address may be invalid.
  const [filterType, setFilterType] = useState<TokenFilterType>('Collected');
  const [sortType, setSortType] = useState<NftSelectorSortView>('Recently added');
  const [network, setNetwork] = useState<Chain>('Ethereum');

  const isMobile = useIsMobileWindowWidth();

  useEffect(() => {
    if (chain && typeof chain === 'string' && isSupportedChain(chain)) {
      setNetwork(chain);
    }
  }, [chain, composer, isMobile]);

  const value = useMemo(
    () => ({
      caption: _caption,
      setCaption,
      captionRef,
      filterType,
      setFilterType,
      sortType,
      setSortType,
      network,
      setNetwork,
    }),
    [_caption, filterType, network, sortType]
  );

  return <PostComposerContext.Provider value={value}>{children}</PostComposerContext.Provider>;
});

PostComposerProvider.displayName = 'PostComposerProvider';

export default PostComposerProvider;

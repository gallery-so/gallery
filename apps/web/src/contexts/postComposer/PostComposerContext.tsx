import { useRouter } from 'next/router';
import {
  createContext,
  memo,
  MutableRefObject,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TokenFilterType } from '~/components/GalleryEditor/PiecesSidebar/SidebarViewSelector';
import { NftSelectorContractType } from '~/components/NftSelector/NftSelector';
import { NftSelectorSortView } from '~/components/NftSelector/NftSelectorFilter/NftSelectorFilterSort';
import { useIsMobileWindowWidth } from '~/hooks/useWindowSize';
import { Chain, isSupportedChain } from '~/shared/utils/chains';
import { useClearURLQueryParamsImperatively } from '~/utils/useClearURLQueryParams';

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
  selectedContract: NftSelectorContractType;
  setSelectedContract: (s: NftSelectorContractType) => void;
  mintPageUrl: string;
  clearUrlParamsAndSelections: () => void;
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
    // public docs for these fields: https://gallery-so.notion.site/Share-On-Gallery-Redirect-Scheme-ea74bddd819e4b0eab6c5f88dd850fe5?pvs=4
    query: {
      composer,
      //------ required fields
      // tokenId, // TODO: actually use this fallback
      // contractAddress, // TODO: auto-select contract.
      chain,
      //------ optional fields
      // collection_title: collectionTitle, // TODO: actually use this fallback
      // token_title: tokenTitle, // TODO: actually use this fallback
      // image_url: imageUrl, // TODO: actually use this fallback
      caption,
      mint_page_url,
    },
  } = useRouter();

  const defaultCaption = useMemo(() => {
    if (typeof caption === 'string') {
      return caption;
    }
    return '';
  }, [caption]);

  const [_caption, setCaption] = useState(defaultCaption);
  const [mintPageUrl, setMintPageUrl] = useState(
    typeof mint_page_url === 'string' ? mint_page_url : ''
  );

  const captionRef = useRef('');

  useEffect(() => {
    captionRef.current = _caption;
  }, [_caption]);

  const [filterType, setFilterType] = useState<TokenFilterType>('Collected');
  const [sortType, setSortType] = useState<NftSelectorSortView>('Recently added');
  const [network, setNetwork] = useState<Chain>('Ethereum');
  const [selectedContract, setSelectedContract] = useState<NftSelectorContractType>(null);

  const isMobile = useIsMobileWindowWidth();

  useEffect(() => {
    if (composer === 'true' && chain && typeof chain === 'string' && isSupportedChain(chain)) {
      // Capitalize the first letter of the chain name that we get from the router to match the Chain type
      const capitalizedChainName = chain.charAt(0).toUpperCase() + chain.slice(1);
      setNetwork(capitalizedChainName as Chain);
    }
  }, [chain, composer, isMobile]);

  // after the user is done posting, we should clear out their presets so that – for example – we don't autopopulate
  // an incorrect `mint_page_url` for a different NFT.
  const clearURLQueryParams = useClearURLQueryParamsImperatively([
    'composer',
    'caption',
    'mint_page_url',
    'contractAddress',
    'tokenId',
    'collection_title',
    'token_title',
    'image_url',
    'platform',
    'chain',
  ]);
  const clearUrlParamsAndSelections = useCallback(() => {
    clearURLQueryParams();

    // we'll clear the caption and mint page URL, but we'll keep other presets like filter type, sort type
    setCaption('');
    setMintPageUrl('');
  }, [clearURLQueryParams]);

  /**
   * TODO: we want to run autosync for certain chains when a user selects them from the dropdown.
   * however, there are a couple issues:
   * 1) the autosync will run *every* time the user selects a chain. so if they're quickly switching
   *    back and forth between many chains, we'll be firing a lot of syncs. solution: just trigger it
   *    once globally per chain for that session.
   * 2) while syncing, the entire modal goes into a loading state. this is problematic if the user
   *    has many ETH NFTs, selects ETH, and the modal looks blocked / loading for 30 seconds.
   *    solution: need a "background" syncing mode that doesn't block the UI
   */
  // const { syncTokens } = useSyncTokens();
  // useEffect(
  //   function handleAutoSync() {
  //     const chainMetadata = chains.find((c) => c.name === network);
  //     if (chainMetadata?.shouldAutoRefresh && filterType === 'Collected') {
  //       syncTokens({
  //         type: filterType,
  //         chain: network,
  //       });
  //     }
  //   },
  //   // not passing in `syncTokens` because the function is unstable and gets
  //   // redefined when new tokens are fetched
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [filterType, network]
  // );

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
      selectedContract,
      setSelectedContract,
      mintPageUrl,
      clearUrlParamsAndSelections,
    }),
    [
      _caption,
      filterType,
      sortType,
      network,
      selectedContract,
      mintPageUrl,
      clearUrlParamsAndSelections,
    ]
  );

  return <PostComposerContext.Provider value={value}>{children}</PostComposerContext.Provider>;
});

PostComposerProvider.displayName = 'PostComposerProvider';

export default PostComposerProvider;

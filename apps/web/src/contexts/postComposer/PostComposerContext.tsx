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

type PostComposerState = {
  caption: string;
  setCaption: (s: string) => void;
  captionRef: MutableRefObject<string>;
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

  const value = useMemo(
    () => ({
      caption,
      setCaption,
      captionRef,
    }),
    [caption]
  );

  return <PostComposerContext.Provider value={value}>{children}</PostComposerContext.Provider>;
});

PostComposerProvider.displayName = 'PostComposerProvider';

export default PostComposerProvider;

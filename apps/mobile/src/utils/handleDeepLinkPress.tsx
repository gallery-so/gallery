import { RootStackNavigatorProp } from '~/navigation/types';

const KNOWN_NON_DEEPLINK_ROUTES = ['community', '~'];

export async function handleDeepLinkPress(url: string, navigation: RootStackNavigatorProp) {
  const parsedUrl = new URL(url);
  const splitBySlash = parsedUrl.pathname.split('/').filter(Boolean);

  // if the url is for a route we don't support deeplinking to, return early so we don't treat it as a username, collectionId, etc.
  if (typeof splitBySlash[0] === 'string' && KNOWN_NON_DEEPLINK_ROUTES.includes(splitBySlash[0])) {
    return;
  }

  /**
   * /post/:postId
   */
  if (parsedUrl.pathname.includes('post/')) {
    const [, maybePostId] = splitBySlash;

    if (maybePostId) {
      navigation.navigate('MainTabs', {
        screen: 'HomeTab',
        params: {
          screen: 'Post',
          params: { postId: maybePostId },
        },
      });
    }

    return;
  }

  if (splitBySlash.length === 1) {
    const [maybeUsername] = splitBySlash;

    /**
     * /:username
     */
    if (maybeUsername) {
      navigation.navigate('MainTabs', {
        screen: 'HomeTab',
        params: {
          screen: 'Profile',
          params: { username: maybeUsername },
        },
      });
    }
  } else if (splitBySlash.length === 2) {
    const [maybeUsername, maybeCollectionId] = splitBySlash;

    /**
     * /:username/:collectionId
     */
    if (maybeUsername && maybeCollectionId) {
      navigation.navigate('MainTabs', {
        screen: 'HomeTab',
        params: {
          screen: 'Collection',
          params: { collectionId: maybeCollectionId },
        },
      });
    }
  } else if (splitBySlash.length === 3) {
    const [maybeUsername, maybeCollectionIdOrGalleries, maybeTokenIdOrGalleryId] = splitBySlash;

    if (maybeUsername && maybeCollectionIdOrGalleries && maybeTokenIdOrGalleryId) {
      /**
       * /:username/galleries/:galleryId
       */
      if (maybeCollectionIdOrGalleries === 'galleries') {
        navigation.navigate('MainTabs', {
          screen: 'HomeTab',
          params: {
            screen: 'Gallery',
            params: { galleryId: maybeTokenIdOrGalleryId },
          },
        });
        /**
         * /:username/:collectionId/:tokenId
         */
      } else {
        navigation.navigate('MainTabs', {
          screen: 'HomeTab',
          params: {
            screen: 'NftDetail',
            params: {
              tokenId: maybeTokenIdOrGalleryId,
              collectionId: maybeCollectionIdOrGalleries,
              cachedPreviewAssetUrl: null,
            },
          },
        });
      }
    }
  }
}

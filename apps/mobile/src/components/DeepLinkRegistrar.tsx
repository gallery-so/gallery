import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Linking } from 'react-native';
import { fetchQuery, graphql, useRelayEnvironment } from 'react-relay';

import { DeepLinkRegistrarAuthCheckQuery } from '~/generated/DeepLinkRegistrarAuthCheckQuery.graphql';
import { RootStackNavigatorProp } from '~/navigation/types';
import { useTrack } from '~/shared/contexts/AnalyticsContext';

export function DeepLinkRegistrar() {
  const relayEnvironment = useRelayEnvironment();
  const track = useTrack();
  const navigation = useNavigation<RootStackNavigatorProp>();

  useEffect(() => {
    // Need to support
    // 1. /:username
    // 2. /:username/:collectionId
    // 3. /:username/:collectionId/:tokenId
    // 4. /:username/galleries/:galleryId
    async function handleDeepLinkToUrl({ url }: { url: string }) {
      track('Deep Link Opened', { url });

      const response = await fetchQuery<DeepLinkRegistrarAuthCheckQuery>(
        relayEnvironment,
        graphql`
          query DeepLinkRegistrarAuthCheckQuery {
            viewer {
              __typename
            }
          }
        `,
        {},
        { fetchPolicy: 'store-or-network' }
      ).toPromise();

      // If the user is not logged in, they cannot handle the deep links
      // This may change in the future when we supported logged out users
      if (response?.viewer?.__typename !== 'Viewer') {
        track('Deep Link Cancelled because signed out', { url });

        return;
      }

      const parsedUrl = new URL(url);

      if (parsedUrl.pathname === '/mobile/marfa') {
        navigation.navigate('MainTabs', {
          screen: 'HomeTab',
          params: {
            screen: 'Home',
            params: { screen: 'Curated', params: { showMarfaCheckIn: true } },
          },
        });
        return;
      }

      const splitBySlash = parsedUrl.pathname.split('/').filter(Boolean);

      if (splitBySlash.length === 1) {
        const [maybeUsername] = splitBySlash;

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
          if (maybeCollectionIdOrGalleries === 'galleries') {
            navigation.navigate('MainTabs', {
              screen: 'HomeTab',
              params: {
                screen: 'Gallery',
                params: { galleryId: maybeTokenIdOrGalleryId },
              },
            });
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

    const listener = Linking.addEventListener('url', handleDeepLinkToUrl);

    // Make sure we handle the case where the app is on a cold start
    // and we don't receive an event.
    Linking.getInitialURL().then((maybeUrl) => {
      if (maybeUrl) {
        handleDeepLinkToUrl({ url: maybeUrl });
      }
    });

    return () => listener.remove();
  }, [navigation, relayEnvironment, track]);

  return null;
}

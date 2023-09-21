import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';

const CACHE_FOLDER = FileSystem.cacheDirectory + 'video/';
const VIDEO_NAME = 'onboarding_video.mp4';
const VIDEO_URI =
  'https://storage.googleapis.com/gallery-prod-325303.appspot.com/mobile_onboarding_animation.mp4';

export const INTRO_VIDEO_STORAGE_KEY = 'introVideoLoaded';

export function useCacheIntroVideo() {
  const [introVideoLoaded, setIntroVideoLoaded] = useState(false);
  const [uri, setUri] = useState<string | null>(null);

  const cacheVideo = async () => {
    const videoCache = CACHE_FOLDER + VIDEO_NAME;

    // Ensure the folder exists
    await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true });

    // Download and cache the video
    try {
      const { uri } = await FileSystem.downloadAsync(VIDEO_URI, videoCache);
      setUri(uri);
      AsyncStorage.setItem(INTRO_VIDEO_STORAGE_KEY, uri);
    } catch (error) {
      // If there was an error, fallback to the network URI
      setUri(VIDEO_URI);
    } finally {
      setIntroVideoLoaded(true);
    }
  };

  // Only cache the video if it hasn't been cached before
  useEffect(() => {
    AsyncStorage.getItem(INTRO_VIDEO_STORAGE_KEY).then((value) => {
      if (value) {
        setUri(value);
        setIntroVideoLoaded(true);
      } else {
        cacheVideo();
      }
    });
  }, []);

  return {
    introVideoLoaded,
    uri: uri,
  };
}

import clsx from 'clsx';
import { BlurView } from 'expo-blur';
import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { contexts } from 'shared/analytics/constants';

import { useWelcomeNewUserActions } from '~/contexts/WelcomeNewUserContext';

import { GalleryTouchableOpacity } from './GalleryTouchableOpacity';
import { Typography } from './Typography';
import { WelcomeNewUser } from './WelcomeNewUser';

type Props = {
  username: string;
};

export function WelcomeNewUserOnboarding({ username }: Props) {
  const { step, nextStep } = useWelcomeNewUserActions();

  if (step > 3 || step === 0) {
    return null;
  }

  if (step === 1) {
    return <WelcomeNewUser username={username} onContinue={nextStep} />;
  }

  return (
    <BlurView intensity={4} className="absolute h-full w-full top-0 bg-black/50 z-30">
      <GalleryTouchableOpacity
        className="absolute h-full w-full top-0 z-30"
        onPress={nextStep}
        eventElementId="Welcome New User Tutorial"
        eventName="Welcome New User Tutorial Clicked"
        eventContext={contexts.Onboarding}
        properties={{
          step: step === 2 ? 'Post' : 'Profile',
        }}
      >
        {step === 2 && (
          <Toast message="Tap here to post an item from your collection" step={step} />
        )}

        {step === 3 && <Toast message="Tap here to set up your Profile" step={step} />}
      </GalleryTouchableOpacity>
    </BlurView>
  );
}

function Toast({ message, step }: { message: string; step: number }) {
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      delay: 300,
    }).start();
  }, [translateY]);

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className={clsx('absolute bottom-0 justify-center w-full pb-2', {
        'items-center': step === 2,
        'items-end pr-2': step === 3,
      })}
    >
      <View className="bg-white py-1 px-2 rounded-[1px]">
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {message}
        </Typography>
      </View>
    </Animated.View>
  );
}

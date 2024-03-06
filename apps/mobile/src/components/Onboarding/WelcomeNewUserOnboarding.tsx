import clsx from 'clsx';
import { BlurView } from 'expo-blur';
import { useColorScheme } from 'nativewind';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { contexts } from 'shared/analytics/constants';
import colors from 'shared/theme/colors';

import { GLogo } from '~/navigation/MainTabNavigator/GLogo';
import { NotificationsIcon } from '~/navigation/MainTabNavigator/NotificationsIcon';
import { PostIcon } from '~/navigation/MainTabNavigator/PostIcon';
import { SearchIcon } from '~/navigation/MainTabNavigator/SearchIcon';
import { LazyAccountTabItem } from '~/navigation/MainTabNavigator/TabBar';

import { GalleryTouchableOpacity } from '../GalleryTouchableOpacity';
import { Typography } from '../Typography';
import { WelcomeNewUser } from './WelcomeNewUser';
import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';

type Props = {
  username: string;
  onComplete: () => void;
};

export function WelcomeNewUserOnboarding({ username, onComplete }: Props) {
  const { colorScheme } = useColorScheme();

  // Step 1: Welcome message
  // Step 2: Post message
  // Step 3: Profile message

  const [step, setStep] = useState(1);

  const { bottom } = useSafeAreaInsets();
  const hasSafeAreaIntersection = bottom !== 0;

  const nextStep = useCallback(() => {
    if (step === 3) {
      setStep(0);
      onComplete();
      return;
    }

    if (step === 1) {
      // Wait for the bottom sheet to dismiss before moving to the next step
      setTimeout(() => {
        setStep((prevStep) => prevStep + 1);
      }, 400);
      return;
    }

    setStep((prevStep) => prevStep + 1);
  }, [step]);

  if (step > 3 || step === 0) {
    return null;
  }

  if (step === 1) {
    return <WelcomeNewUser username={username} onContinue={nextStep} />;
  }

  return (
    <BlurView intensity={4} className="absolute h-full w-full top-0 bg-black/50 z-30">
      <GalleryTouchableOpacity
        className="relative h-full w-full"
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

        <View
          style={hasSafeAreaIntersection ? { paddingBottom: bottom } : { paddingBottom: 12 }}
          className="w-full bottom-0 bg-white dark:bg-black-900 absolute flex flex-row items-center justify-evenly border-t border-porcelain dark:border-black-600"
        >
          <TabItem onPress={nextStep} isFocused>
            <GLogo />
          </TabItem>
          <TabItem onPress={nextStep}>
            <SearchIcon />
          </TabItem>
          <TabItem active={step === 2} onPress={nextStep}>
            <PostIcon color={colorScheme === 'dark' ? colors.white : colors.black['800']} />
          </TabItem>
          <TabItem onPress={nextStep}>
            <NotificationsIcon />
          </TabItem>
          <TabItem active={step === 3} onPress={nextStep}>
            <LazyAccountTabItem />
          </TabItem>
        </View>
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
      className={clsx('absolute bottom-20 justify-center w-full pb-2', {
        'items-center': step === 2,
        'items-end pr-2': step === 3,
      })}
    >
      <View className="bg-white dark:bg-black-900 py-1 px-2 rounded-[1px]">
        <Typography className="text-xs" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
          {message}
        </Typography>
      </View>
    </Animated.View>
  );
}

type TabItemProps = {
  children: React.ReactNode;
  active?: boolean;
  onPress: () => void;
  isFocused?: boolean;
};

function TabItem({ children, active = false, onPress, isFocused }: TabItemProps) {
  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      activeOpacity={1}
      className="pt-3 px-4 flex items-center justify-center"
      eventName="Welcome New User Tutorial Clicked"
      eventElementId="Welcome New User Tutorial"
      eventContext={contexts.Onboarding}
    >
      <View
        className={clsx('px-0 flex h-8 w-8 items-center justify-center rounded-full', {
          'opacity-25': !active,
          'bg-activeBlue/10 dark:bg-darkModeBlue/10': active,
          'border border-black dark:border-white ': isFocused,
        })}
      >
        {children}
      </View>
    </GalleryTouchableOpacity>
  );
}

import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';
import { Typography } from '~/components/Typography';
import { LoginStackNavigatorProp } from '~/navigation/types';
import colors from '~/shared/theme/colors';

export function OnboardingProfileBioScreen() {
  const navigation = useNavigation<LoginStackNavigatorProp>();
  const { colorScheme } = useColorScheme();

  const { top, bottom } = useSafeAreaInsets();

  const [username, setUsername] = useState('');

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSelectProfilePicture = useCallback(() => {
    navigation.navigate('OnboardingNftSelector', {
      page: 'ProfilePicture',
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ paddingTop: top }}
      className="flex flex-1 flex-col bg-white dark:bg-black-900"
    >
      <View className="flex flex-col flex-grow space-y-8 px-4">
        <View className="relative flex-row items-center justify-between ">
          <BackButton onPress={handleBack} />

          <View
            className="absolute w-full flex flex-row justify-center items-center"
            pointerEvents="none"
          >
            <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
              Set up your profile
            </Typography>
          </View>

          <View />
        </View>

        <View
          className="flex-1 items-center justify-center space-y-12 px-8"
          style={{
            marginBottom: bottom,
          }}
        >
          <View>
            <RawProfilePicture
              eventElementId="ProfilePicture"
              eventName="ProfilePicture pressed"
              letter="D"
              size="xxl"
              isEditable
              onPress={handleSelectProfilePicture}
            />
          </View>

          <TextInput
            style={{
              fontSize: 24,
              fontFamily: 'GTAlpinaStandardLight',
            }}
            className="dark:text-white text-center"
            placeholderTextColor={colors.metal}
            selectionColor={colorScheme === 'dark' ? colors.offWhite : colors.black['800']}
            textAlignVertical="center"
            placeholder="tell us about yourself..."
            value={username}
            onChange={(e) => setUsername(e.nativeEvent.text)}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          <Button
            variant="secondary"
            className="w-full"
            eventElementId={null}
            eventName={null}
            text="SKIP"
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

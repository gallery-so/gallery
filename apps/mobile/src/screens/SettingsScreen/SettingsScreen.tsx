import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { PropsWithChildren, ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Linking, ScrollView, Text, View, ViewProps } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import { QuestionCircleIcon } from 'src/icons/QuestionCircleIcon';

import { BackButton } from '~/components/BackButton';
import { Button } from '~/components/Button';
import { FeedbackBottomSheet } from '~/components/FeedbackBottomSheet';
import { GalleryBottomSheetModalType } from '~/components/GalleryBottomSheet/GalleryBottomSheetModal';
import { GalleryLink } from '~/components/GalleryLink';
import { GalleryTouchableOpacity } from '~/components/GalleryTouchableOpacity';
import { Typography } from '~/components/Typography';
import { SettingsScreenQuery } from '~/generated/SettingsScreenQuery.graphql';
import { NotificationsIcon } from '~/navigation/MainTabNavigator/NotificationsIcon';
import { MainTabStackNavigatorProp } from '~/navigation/types';
import { contexts } from '~/shared/analytics/constants';

import { useLogout } from '../../hooks/useLogout';
import { BugReportIcon } from '../../icons/BugReportIcon';
import { DiscordIcon } from '../../icons/DiscordIcon';
import { RightArrowIcon } from '../../icons/RightArrowIcon';
import { TwitterIcon } from '../../icons/TwitterIcon';
import { DebugBottomSheet } from './DebugBottomSheet';

const appVersion = Constants.expoConfig?.version;
const commitHash = Constants.expoConfig?.extra?.commitHash;

export function SettingsScreen() {
  const query = useLazyLoadQuery<SettingsScreenQuery>(
    graphql`
      query SettingsScreenQuery {
        viewer {
          ... on Viewer {
            user {
              roles
            }
          }
        }
      }
    `,
    {}
  );

  const feedbackBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const debugBottomSheetRef = useRef<GalleryBottomSheetModalType | null>(null);
  const navigation = useNavigation<MainTabStackNavigatorProp>();

  const [bottomSectionHeight, setBottomSectionHeight] = useState(200);

  const handleBugReportPress = useCallback(() => {
    feedbackBottomSheetRef.current?.present();
  }, []);

  const handleDebugPress = useCallback(() => {
    debugBottomSheetRef.current?.present();
  }, []);

  const handleDiscordPress = useCallback(() => {
    Linking.openURL('https://discord.gg/U6Xx8heTXY');
  }, []);

  const handleFaqPress = useCallback(() => {
    Linking.openURL(
      'https://gallery-so.notion.site/Gallery-Support-Docs-d317f077d7614935bdf2c039349823d2'
    );
  }, []);

  const handleTwitterPress = useCallback(() => {
    Linking.openURL('https://twitter.com/GALLERY');
  }, []);

  const handleNotificationsPress = useCallback(() => {
    navigation.navigate('NotificationSettingsScreen');
  }, [navigation]);

  const [logout, isLoggingOut] = useLogout();
  const handleSignOut = useCallback(() => {
    logout();
  }, [logout]);

  const handleBottomSectionLayout = useCallback((event: LayoutChangeEvent) => {
    setBottomSectionHeight(event.nativeEvent.layout.height);
  }, []);

  const formattedCommitHash = commitHash?.slice(0, 6);

  const isAdminUser = useMemo(() => {
    return query.viewer?.user?.roles?.includes('ADMIN') ?? false;
  }, [query.viewer?.user?.roles]);

  return (
    <View className="relative flex-1 bg-white dark:bg-black-900 pt-4">
      <View className="px-4 relative mb-2">
        <BackButton />

        <View
          className="absolute inset-0 flex flex-row justify-center items-center"
          pointerEvents="none"
        >
          <Typography className="text-sm" font={{ family: 'ABCDiatype', weight: 'Bold' }}>
            Settings
          </Typography>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomSectionHeight + 24 }}
        className="px-2 pt-2 space-y-6 flex flex-col"
      >
        <SettingsSection>
          <SettingsRow
            onPress={handleNotificationsPress}
            text="Notifications"
            icon={<NotificationsIcon width={24} />}
          />
        </SettingsSection>
        <SettingsSection>
          <SettingsRow
            onPress={handleBugReportPress}
            text="Report a bug"
            icon={<BugReportIcon width={24} height={24} />}
          />
          <SettingsRow onPress={handleFaqPress} text="FAQ" icon={<QuestionCircleIcon />} />
          <SettingsRow
            onPress={handleDiscordPress}
            text="Discord"
            icon={<DiscordIcon width={24} />}
          />
          <SettingsRow
            onPress={handleTwitterPress}
            text="Twitter"
            icon={<TwitterIcon width={24} />}
          />
        </SettingsSection>
      </ScrollView>

      <View
        onLayout={handleBottomSectionLayout}
        className="absolute bottom-0 left-0 right-0 bg-white dark:bg-black-900 border-t border-porcelain dark:border-black-500 py-8 flex flex-col items-center space-y-3"
      >
        <Button
          onPress={handleSignOut}
          loading={isLoggingOut}
          variant="danger"
          text="SIGN OUT"
          eventElementId="sign-out-button"
          eventName="sign-out-button-pressed"
          eventContext={contexts.Settings}
        />

        <View className="flex flex-col space-y-2 items-center">
          {appVersion && (
            <Typography
              className="text-sm text-metal"
              font={{ family: 'ABCDiatype', weight: 'Regular' }}
            >
              v{appVersion} {formattedCommitHash && `| ${formattedCommitHash}`}
            </Typography>
          )}

          <GalleryLink
            href="https://gallery.so/terms"
            eventElementId={null}
            eventName={null}
            eventContext={null}
          >
            TERMS
          </GalleryLink>
          <GalleryLink
            href="https://gallery.so/privacy"
            eventElementId={null}
            eventName={null}
            eventContext={null}
          >
            PRIVACY POLICY
          </GalleryLink>
          {isAdminUser && (
            <GalleryTouchableOpacity
              onPress={handleDebugPress}
              eventElementId={null}
              eventName={null}
              eventContext={null}
            >
              <Text className="text-shadow dark:text-white">DEBUG</Text>
            </GalleryTouchableOpacity>
          )}
        </View>
      </View>

      <FeedbackBottomSheet ref={feedbackBottomSheetRef} />
      {isAdminUser && <DebugBottomSheet ref={debugBottomSheetRef} />}
    </View>
  );
}

function SettingsSection({ children, style }: PropsWithChildren<{ style?: ViewProps['style'] }>) {
  return (
    <View className="space-y-2" style={style}>
      {children}
    </View>
  );
}

type SettingsRowProps = {
  onPress: () => void;
  text: string;
  icon: ReactNode;
  style?: ViewProps['style'];
};

function SettingsRow({ style, icon, text, onPress }: SettingsRowProps) {
  return (
    <GalleryTouchableOpacity
      onPress={onPress}
      eventElementId="settings-row"
      eventName="settings-row-clicked"
      eventContext={contexts.Settings}
      properties={{ text }}
      style={style}
      className="flex flex-row justify-between items-center bg-offWhite dark:bg-black-800 px-3 h-12"
    >
      <View className="flex flex-row space-x-3 items-center">
        <View className="w-6 h-full flex items-center">{icon}</View>

        <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>{text}</Typography>
      </View>

      <View>
        <RightArrowIcon />
      </View>
    </GalleryTouchableOpacity>
  );
}

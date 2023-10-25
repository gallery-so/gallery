import { PropsWithChildren } from 'react';
import { ScrollView, View, ViewProps } from 'react-native';

import { Button } from '~/components/Button';
import { DarkModeToggle } from '~/components/DarkModeToggle';
import { RawProfilePicture } from '~/components/ProfilePicture/RawProfilePicture';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';

import { QRCodeIcon } from '../icons/QRCodeIcon';

const avatarUrl =
  'https://s3-alpha-sig.figma.com/img/9a4f/b777/fe4c335512ca4297ad4fd60554e66f18?Expires=1688342400&Signature=qkFea-QACeUhPrbGDD7yxcKCsvViLLP8l7gsEWDVaE-vJMZg7o71rmHqBY888UIiAC2dAgkuLzJR~0oFvM6M1iWnXCudJfJB64l4n9m1R0DDofhBTCp3Is-wXGx5NQzdvAYBKHUZtfHBCDUHLR2sj1EqL3QMwOR4mKnFhpq79y2Bd~0E1r5ulGAfOt85vXhcgbcspBOGW410Yetij4x7P2RidYGi7xwDgEg26hMUxeaapE~mZETmQupLCuWkl2eaLhDXvnUsXiek0IPYhNS~SxYvqQOok5R~DK2WleQGL7hiGfbLfAgVPloPIIB1kuZTepRTlBMh1MASPd6l1Fk3Zw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4';

export function DesignSystemButtonsScreen() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-black-900">
      <SafeAreaViewWithPadding>
        <View className="flex flex-col">
          <View className="flex flex-col p-4 space-y-2">
            <DarkModeToggle />

            <Typography className="text-black" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              Buttons
            </Typography>

            <View className="flex flex-row space-x-2">
              <Button
                text="SCAN"
                variant="primary"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
              <Button
                text="SCAN"
                variant="secondary"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
              <Button
                text="SCAN"
                variant="danger"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                loading
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="primary"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
              <Button
                loading
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="secondary"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
              <Button
                text="SCAN"
                loading
                icon={<QRCodeIcon />}
                variant="danger"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="primary"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
              <Button
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="secondary"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
              <Button
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="danger"
                eventElementId={null}
                eventName={null}
                eventContext={null}
              />
            </View>
          </View>

          <View className="flex flex-col p-4 space-y-2">
            <Typography font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              Profile Pictures
            </Typography>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                hasInset
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                hasInset
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                hasInset
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                hasInset
                size="xl"
              />
            </ProfilePictureSection>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                letter="F"
                size="xl"
              />
            </ProfilePictureSection>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                imageUrl={avatarUrl}
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                imageUrl={avatarUrl}
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                imageUrl={avatarUrl}
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                imageUrl={avatarUrl}
                size="xl"
              />
            </ProfilePictureSection>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                hasInset
                imageUrl={avatarUrl}
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                hasInset
                imageUrl={avatarUrl}
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                hasInset
                imageUrl={avatarUrl}
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                hasInset
                imageUrl={avatarUrl}
                size="xl"
              />
            </ProfilePictureSection>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                hasInset
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                hasInset
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                hasInset
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                hasInset
                size="xl"
              />
            </ProfilePictureSection>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                letter="F"
                size="xl"
              />
            </ProfilePictureSection>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                imageUrl={avatarUrl}
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                imageUrl={avatarUrl}
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                imageUrl={avatarUrl}
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                imageUrl={avatarUrl}
                size="xl"
              />
            </ProfilePictureSection>

            <ProfilePictureSection>
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                hasInset
                imageUrl={avatarUrl}
                size="sm"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                hasInset
                imageUrl={avatarUrl}
                size="md"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                hasInset
                imageUrl={avatarUrl}
                size="lg"
              />
              <RawProfilePicture
                eventElementId={null}
                eventName={null}
                eventContext={null}
                isEditable
                hasInset
                imageUrl={avatarUrl}
                size="xl"
              />
            </ProfilePictureSection>
          </View>
        </View>
      </SafeAreaViewWithPadding>
    </ScrollView>
  );
}

function ProfilePictureSection({
  children,
  style,
}: PropsWithChildren<{ style?: ViewProps['style'] }>) {
  return (
    <View className="flex flex-row space-x-2" style={style}>
      {children}
    </View>
  );
}

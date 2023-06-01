import { ScrollView, View } from 'react-native';

import { Button } from '~/components/Button';
import { SafeAreaViewWithPadding } from '~/components/SafeAreaViewWithPadding';
import { Typography } from '~/components/Typography';

import { QRCodeIcon } from '../icons/QRCodeIcon';

export function DesignSystemButtonsScreen() {
  return (
    <ScrollView className="flex-1 bg-white dark:bg-black-900">
      <SafeAreaViewWithPadding>
        <View className="flex flex-col">
          <View className="flex flex-col bg-white p-4 space-y-2">
            <Typography className="text-black" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              Light Mode
            </Typography>

            <View className="flex flex-row space-x-2">
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                text="SCAN"
                variant="primary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                text="SCAN"
                variant="secondary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                text="SCAN"
                variant="danger"
                eventElementId={null}
                eventName={null}
              />
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                loading
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="primary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                loading
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="secondary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                text="SCAN"
                loading
                icon={<QRCodeIcon />}
                variant="danger"
                eventElementId={null}
                eventName={null}
              />
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="primary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="secondary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="light"
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="danger"
                eventElementId={null}
                eventName={null}
              />
            </View>
          </View>

          <View className="flex flex-col bg-black-800 p-4 space-y-2">
            <Typography className="text-white" font={{ family: 'ABCDiatype', weight: 'Regular' }}>
              Dark Mode
            </Typography>

            <View className="flex flex-row space-x-2">
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                text="SCAN"
                variant="primary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                text="SCAN"
                variant="secondary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                text="SCAN"
                variant="danger"
                eventElementId={null}
                eventName={null}
              />
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                loading
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="primary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                loading
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="secondary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                text="SCAN"
                loading
                icon={<QRCodeIcon />}
                variant="danger"
                eventElementId={null}
                eventName={null}
              />
            </View>

            <View className="flex flex-row space-x-2">
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="primary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="secondary"
                eventElementId={null}
                eventName={null}
              />
              <Button
                DO_NOT_USE_OR_YOU_WILL_BE_FIRED_colorScheme="dark"
                text="SCAN"
                icon={<QRCodeIcon />}
                variant="danger"
                eventElementId={null}
                eventName={null}
              />
            </View>
          </View>
        </View>
      </SafeAreaViewWithPadding>
    </ScrollView>
  );
}

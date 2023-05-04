import { Button } from '~/components/core/Button/Button';
import InteractiveLink from '~/components/core/InteractiveLink/InteractiveLink';
import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';

import SettingsRowDescription from '../SettingsRowDescription';

export default function MobileAuthManagerSection() {
  return (
    <VStack gap={16}>
      <VStack>
        <TitleDiatypeL>Pair with Mobile</TitleDiatypeL>
        <SettingsRowDescription>
          Use a QR Code to sign in to the Gallery mobile app.
        </SettingsRowDescription>
      </VStack>
      <VStack justify="center" align="start" gap={8}>
        <Button>View QR Code</Button>
        <InteractiveLink to={{ pathname: '/mobile' }}>Learn more about the app</InteractiveLink>
      </VStack>
    </VStack>
  );
}

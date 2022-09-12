import { BaseM, TitleDiatypeL } from 'components/core/Text/Text';
import { VStack } from 'components/core/Spacer/Stack';

type Props = {
  chain: string;
};

export function EmptySidebar({ chain }: Props) {
  return (
    <VStack grow align="center" justify="center">
      <TitleDiatypeL>It&apos;s looking empty</TitleDiatypeL>
      <BaseM>You do not have any {chain} NFTs</BaseM>
    </VStack>
  );
}

import { graphql, useFragment } from 'react-relay';

import { VStack } from '~/components/core/Spacer/Stack';
import { TitleDiatypeL } from '~/components/core/Text/Text';
import TwitterSetting from '~/components/Twitter/TwitterSetting';
import { ManageTwitterSectionFragment$key } from '~/generated/ManageTwitterSectionFragment.graphql';

type Props = {
  queryRef: ManageTwitterSectionFragment$key;
};

export default function ManageTwitterSection({ queryRef }: Props) {
  const query = useFragment(
    graphql`
      fragment ManageTwitterSectionFragment on Query {
        ...TwitterSettingFragment
      }
    `,
    queryRef
  );

  return (
    <VStack gap={16}>
      <TitleDiatypeL>Connect Twitter</TitleDiatypeL>
      <TwitterSetting queryRef={query} />
    </VStack>
  );
}

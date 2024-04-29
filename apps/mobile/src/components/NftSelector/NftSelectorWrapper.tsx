import { PropsWithChildren, Suspense, useEffect } from 'react';
import { View } from 'react-native';
import { graphql, useLazyLoadQuery } from 'react-relay';
import useExperience from 'shared/hooks/useExperience';

import { useBottomSheetModalActions } from '~/contexts/BottomSheetModalContext';
import { NftSelectorWrapperExperienceQuery } from '~/generated/NftSelectorWrapperExperienceQuery.graphql';
import CreatorSupportAnnouncementBottomSheetModal from '~/screens/NftSelectorScreen/CreatorSupportAnnouncementBottomSheetModal';

import { useSafeAreaPadding } from '../SafeAreaViewWithPadding';

type Props = {
  isFullscreen?: boolean;
  ownershipTypeFilter: 'Collected' | 'Created';
} & PropsWithChildren;

export function NftSelectorWrapper({ isFullscreen, ownershipTypeFilter, children }: Props) {
  const { top } = useSafeAreaPadding();

  return (
    <View
      className="flex-1 bg-white dark:bg-black-900"
      style={{
        paddingTop: isFullscreen ? top : 16,
      }}
    >
      <View className="flex flex-col flex-grow space-y-4">{children}</View>
      <Suspense>
        <CreatorBottomSheetWrapper isViewingCreatedFilter={ownershipTypeFilter === 'Created'} />
      </Suspense>
    </View>
  );
}

function CreatorBottomSheetWrapper({
  isViewingCreatedFilter,
}: {
  isViewingCreatedFilter: boolean;
}) {
  const experienceQuery = useLazyLoadQuery<NftSelectorWrapperExperienceQuery>(
    graphql`
      query NftSelectorWrapperExperienceQuery {
        ...useExperienceFragment
      }
    `,
    {}
  );

  const [creatorBetaAnnouncementSeen, setCreatorBetaAnnouncementSeen] = useExperience({
    type: 'CreatorBetaMicroAnnouncementModal',
    queryRef: experienceQuery,
  });
  const { showBottomSheetModal, hideBottomSheetModal } = useBottomSheetModalActions();

  useEffect(() => {
    if (isViewingCreatedFilter && !creatorBetaAnnouncementSeen) {
      showBottomSheetModal({
        content: <CreatorSupportAnnouncementBottomSheetModal onClose={hideBottomSheetModal} />,
      });
      setCreatorBetaAnnouncementSeen({ experienced: true });
    }
  }, [
    creatorBetaAnnouncementSeen,
    hideBottomSheetModal,
    isViewingCreatedFilter,
    setCreatorBetaAnnouncementSeen,
    showBottomSheetModal,
  ]);

  useEffect(() => {}, [hideBottomSheetModal, showBottomSheetModal]);

  return <></>;
}

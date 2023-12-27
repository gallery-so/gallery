import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NftAdditionalDetailsPOAPFragment$key } from '~/generated/NftAdditionalDetailsPOAPFragment.graphql';
import {
  DetailLabelText,
  DetailSection,
  DetailValue,
} from '~/screens/NftDetailScreen/DetailSection';
import extractPoapMetadata from '~/shared/utils/extractPoapMetadata';

type POAPNftDetailSectionProps = {
  tokenRef: NftAdditionalDetailsPOAPFragment$key;
};

export function NftAdditionalDetailsPOAP({ tokenRef }: POAPNftDetailSectionProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsPOAPFragment on Token {
        definition {
          tokenMetadata
        }
      }
    `,
    tokenRef
  );

  if (!token.definition.tokenMetadata) {
    return null;
  }

  const { id, location, createdDate, supply, chain } = extractPoapMetadata(
    token.definition.tokenMetadata
  );

  return (
    <View className="flex flex-col space-y-4">
      <>
        {location && (
          <View className="flex flex-row">
            <DetailSection>
              <DetailLabelText>LOCATION</DetailLabelText>
              <DetailValue>{location}</DetailValue>
            </DetailSection>
          </View>
        )}
        <View className="flex flex-row space-x-16">
          {createdDate && (
            <DetailSection>
              <DetailLabelText>CREATED</DetailLabelText>
              <DetailValue>{createdDate}</DetailValue>
            </DetailSection>
          )}

          {id && (
            <DetailSection>
              <DetailLabelText>POAP ID</DetailLabelText>
              <DetailValue>{id}</DetailValue>
            </DetailSection>
          )}
        </View>

        <View className="flex flex-row space-x-16">
          {supply && (
            <DetailSection>
              <DetailLabelText>SUPPLY</DetailLabelText>
              <DetailValue>{supply}</DetailValue>
            </DetailSection>
          )}
          {chain && (
            <DetailSection>
              <DetailLabelText>CHAIN</DetailLabelText>
              <DetailValue>{chain}</DetailValue>
            </DetailSection>
          )}
        </View>
      </>
    </View>
  );
}

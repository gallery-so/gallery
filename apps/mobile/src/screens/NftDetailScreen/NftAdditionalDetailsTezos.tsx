import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { graphql, useFragment } from 'react-relay';

import { NftAdditionalDetailsTezosFragment$key } from '~/generated/NftAdditionalDetailsTezosFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';

import { GalleryLink } from '../../components/GalleryLink';
import { LinkableAddress } from '../../components/LinkableAddress';
import { DetailExternalLink, DetailLabelText, DetailSection, DetailValue } from './DetailSection';

type NftAdditionaDetailsNonPOAPProps = {
  tokenRef: NftAdditionalDetailsTezosFragment$key;
};

export function NftAdditionalDetailsTezos({ tokenRef }: NftAdditionaDetailsNonPOAPProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsTezosFragment on Token {
        definition {
          contract {
            contractAddress {
              address
              ...LinkableAddressFragment
            }
          }
        }
        ...extractRelevantMetadataFromTokenFragment
      }
    `,
    tokenRef
  );

  const { colorScheme } = useColorScheme();
  const { tokenId, chain, fxhashUrl, objktUrl, projectUrl } =
    extractRelevantMetadataFromToken(token);

  const { definition } = token;

  return (
    <View className="flex flex-col space-y-4">
      <View className="flex flex-row space-x-16">
        {definition?.contract?.contractAddress?.address && (
          <DetailSection>
            <DetailLabelText>CONTRACT</DetailLabelText>
            <LinkableAddress
              textStyle={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
              chainAddressRef={definition.contract.contractAddress}
              font={{ family: 'ABCDiatype', weight: 'Bold' }}
              eventElementId="NFT Detail Contract Address"
              eventName="NFT Detail Contract Address Press"
              eventContext={contexts['NFT Detail']}
            />
          </DetailSection>
        )}

        {tokenId && projectUrl && (
          <DetailSection>
            <DetailLabelText>TOKEN ID</DetailLabelText>
            <GalleryLink
              href={projectUrl}
              eventElementId="NFT Detail Token ID"
              eventName="NFT Detail Token ID Press"
              eventContext={contexts['NFT Detail']}
            >
              {tokenId}
            </GalleryLink>
          </DetailSection>
        )}
      </View>

      <View className="flex flex-row">
        {chain && (
          <DetailSection>
            <DetailLabelText>NETWORK</DetailLabelText>
            <DetailValue>{chain}</DetailValue>
          </DetailSection>
        )}
        {fxhashUrl && (
          <DetailSection>
            <DetailLabelText>VIEW ON</DetailLabelText>
            <View className="flex flex-row">
              <DetailExternalLink
                link={fxhashUrl}
                label="fx(hash)"
                showExternalLinkIcon={true}
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              />
            </View>
          </DetailSection>
        )}
        {objktUrl && (
          <DetailSection>
            <DetailLabelText>VIEW ON</DetailLabelText>
            <View className="flex flex-row">
              <DetailExternalLink
                link={objktUrl}
                label="objkt"
                showExternalLinkIcon={true}
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              />
            </View>
          </DetailSection>
        )}
        {projectUrl && (
          <DetailSection>
            <DetailLabelText>VIEW ON</DetailLabelText>
            <View className="flex flex-col pt-4">
              <DetailExternalLink
                link={projectUrl}
                label="Official Site"
                showExternalLinkIcon={true}
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
              />
            </View>
          </DetailSection>
        )}
      </View>
    </View>
  );
}

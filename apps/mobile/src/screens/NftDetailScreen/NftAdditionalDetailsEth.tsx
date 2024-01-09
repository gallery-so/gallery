import { useColorScheme } from 'nativewind';
import { useMemo } from 'react';
import { View } from 'react-native';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';

import { NftAdditionalDetailsEthFragment$key } from '~/generated/NftAdditionalDetailsEthFragment.graphql';
import { contexts } from '~/shared/analytics/constants';
import colors from '~/shared/theme/colors';
import { extractRelevantMetadataFromToken } from '~/shared/utils/extractRelevantMetadataFromToken';

import { LinkableAddress } from '../../components/LinkableAddress';
import { DetailExternalLink, DetailLabelText, DetailSection, DetailValue } from './DetailSection';

type NftAdditionalDetailsEthProps = {
  tokenRef: NftAdditionalDetailsEthFragment$key;
};

export function NftAdditionalDetailsEth({ tokenRef }: NftAdditionalDetailsEthProps) {
  const token = useFragment(
    graphql`
      fragment NftAdditionalDetailsEthFragment on Token {
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

  const { tokenId, openseaUrl, mirrorUrl, prohibitionUrl, projectUrl, chain } =
    extractRelevantMetadataFromToken(token);

  const numOfLinks = useMemo(
    () => [openseaUrl, projectUrl, mirrorUrl, prohibitionUrl].filter(Boolean).length,
    [openseaUrl, projectUrl, mirrorUrl, prohibitionUrl]
  );

  return (
    <View className="flex flex-col space-y-4">
      <View className="flex flex-col space-y-4">
        <View className="flex flex-row space-x-3">
          {token.definition?.contract?.contractAddress?.address && (
            <DetailSection>
              <DetailLabelText>CONTRACT</DetailLabelText>
              <LinkableAddress
                chainAddressRef={token.definition.contract.contractAddress}
                textStyle={{ color: colorScheme === 'dark' ? colors.white : colors.black['800'] }}
                style={{ paddingTop: 2 }}
                font={{ family: 'ABCDiatype', weight: 'Bold' }}
                eventElementId="NFT Detail Contract Address"
                eventName="NFT Detail Contract Address Press"
                eventContext={contexts['NFT Detail']}
              />
            </DetailSection>
          )}

          {tokenId && (
            <DetailSection>
              <DetailLabelText>TOKEN ID</DetailLabelText>
              <DetailValue>{tokenId}</DetailValue>
            </DetailSection>
          )}

          {chain && (
            <DetailSection>
              <DetailLabelText>NETWORK</DetailLabelText>
              <DetailValue>{chain}</DetailValue>
            </DetailSection>
          )}
        </View>

        <View className="flex flex-row space-x-3">
          {openseaUrl && (
            <DetailSection>
              <DetailLabelText>VIEW ON</DetailLabelText>
              <View className="flex flex-row">
                <DetailExternalLink
                  link={openseaUrl}
                  label="OpenSea"
                  showExternalLinkIcon={true}
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
                />
              </View>
            </DetailSection>
          )}

          {mirrorUrl && (
            <DetailSection>
              <DetailLabelText>VIEW ON</DetailLabelText>
              <View className="flex flex-row">
                <DetailExternalLink
                  link={mirrorUrl}
                  label="Mirror"
                  showExternalLinkIcon={true}
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
                />
              </View>
            </DetailSection>
          )}
          {projectUrl && (
            <DetailSection>
              <DetailLabelText>VIEW ON</DetailLabelText>
              <View className="flex flex-col">
                <DetailExternalLink
                  link={projectUrl}
                  label="Official Site"
                  showExternalLinkIcon={true}
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
                />
              </View>
            </DetailSection>
          )}
          {prohibitionUrl && (
            <DetailSection>
              <DetailLabelText>VIEW ON</DetailLabelText>
              <View className="flex flex-row">
                <DetailExternalLink
                  link={prohibitionUrl}
                  label="Prohibition"
                  showExternalLinkIcon={true}
                  font={{ family: 'ABCDiatype', weight: 'Bold' }}
                />
              </View>
            </DetailSection>
          )}
          {numOfLinks === 2 && (
            <DetailSection>
              <DetailLabelText> </DetailLabelText>
            </DetailSection>
          )}
        </View>
      </View>
    </View>
  );
}

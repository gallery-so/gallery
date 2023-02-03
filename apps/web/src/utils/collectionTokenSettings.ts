import { UpdateCollectionTokensInput } from '~/generated/useUpdateCollectionTokensMutation.graphql';

type TokenId = string;
type TokenSettingsObject = Record<TokenId, boolean>;

export function collectionTokenSettingsArrayToObject(
  arr: UpdateCollectionTokensInput['tokenSettings']
) {
  const tokenSettingsObject: TokenSettingsObject = {};
  for (const setting of arr) {
    if (setting.renderLive) {
      tokenSettingsObject[setting.tokenId] = true;
    }
  }
  return tokenSettingsObject;
}

export function collectionTokenSettingsObjectToArray(
  obj: TokenSettingsObject
): Array<{ tokenId: string; renderLive: boolean }> {
  const tokenSettingsArray = [];
  for (const key in obj) {
    tokenSettingsArray.push({
      tokenId: key,
      renderLive: obj[key] ?? false,
    });
  }
  return tokenSettingsArray;
}

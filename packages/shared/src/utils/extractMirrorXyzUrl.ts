export const extractMirrorXyzUrl = (tokenMetadata: string) => {
  let metadataObj;
  try {
    metadataObj = JSON.parse(tokenMetadata);
  } catch (e) {
    return '';
  }
  const tokenDesc = metadataObj?.description ?? '';
  const startsWithMirrorXYZ = tokenDesc?.startsWith('https://mirror.xyz');
  const hasWhitespaceInMiddle = /\s/.test(tokenDesc);
  if (startsWithMirrorXYZ && !hasWhitespaceInMiddle) {
    return tokenDesc;
  }
  return '';
};

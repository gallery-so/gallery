export const extractMirrorXyzUrl = (tokenMetadata: string ) => {
  const metadataObj = JSON.parse(tokenMetadata);
  const tokenDesc = metadataObj.description;
  const startsWithMirrorXYZ = tokenDesc?.startsWith("https://mirror.xyz");
  const hasWhitespaceInMiddle = /\s/.test(tokenDesc);
  if (startsWithMirrorXYZ && !hasWhitespaceInMiddle) {
    return tokenDesc
  }
  return "";
};

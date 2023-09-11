/**
 * This isn't necessarily an error state, but it gets thrown to relevant
 * boundaries if an NFT is still loading. This allows the boundary to display
 * an appropriate `Loading...` fallback.
 */
export class StillLoadingNftError extends Error {}

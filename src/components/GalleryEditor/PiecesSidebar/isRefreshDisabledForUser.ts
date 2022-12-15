/**
 * We want to disable the refresh button for certain user accounts
 * to preserve its state for safekeeping / testing
 */
const userIds = new Set([
  '2Bzfbm6WFqL2eqmSMhVCMyTS2Jb', // 3AC
  '26SYxuvtnv79pxEdm3gbu2n9IhP', // gallery test user
]);

export default function isRefreshDisabledForUser(id: string) {
  return userIds.has(id);
}

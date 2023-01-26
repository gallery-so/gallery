import { mockDebuggerQuery } from './mockDebuggerQuery';
import { mockGlobalLayoutQuery } from './mockGlobalLayoutQuery';

export function mockProviderQueries() {
  mockDebuggerQuery();
  mockGlobalLayoutQuery();
}

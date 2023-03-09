import { createContext } from 'react';

export const RelayResetContext = createContext<(() => void) | undefined>(undefined);

import { useCallback } from 'react';
import { runAPEXViewTransition } from './viewTransitions';

export const useAPEXViewTransition = () =>
  useCallback((update: () => void | Promise<void>) => runAPEXViewTransition(update), []);

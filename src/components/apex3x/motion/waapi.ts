export interface APEXWAAPIOptions extends KeyframeAnimationOptions {
  reducedMotion?: boolean;
}

export const runAPEXWAAPI = (
  element: Element | null,
  keyframes: Keyframe[] | PropertyIndexedKeyframes,
  options: APEXWAAPIOptions = {},
): Animation | null => {
  if (!element || options.reducedMotion || typeof element.animate !== 'function') return null;
  return element.animate(keyframes, options);
};

export const cancelAPEXWAAPI = (animation: Animation | null) => {
  animation?.cancel();
};

export const APEXMOTION = {
  duration: { instant: 0, fast: 140, standard: 200, relaxed: 240, slow: 320 },
  ease: {
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    emphasized: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
  },
  spring: {
    spatial: { stiffness: 420, damping: 34, mass: 1 },
    press: { stiffness: 500, damping: 30, mass: 1 },
    active: { stiffness: 500, damping: 38, mass: 1 },
  },
} as const;

export type APEXMotionCategory =
  | 'navigation'
  | 'accordion'
  | 'press'
  | 'spatial'
  | 'feedback'
  | 'reveal'
  | 'continuity';

export const APEXMOTION_CATEGORY: Record<APEXMotionCategory, {
  duration: number;
  easing: string;
}> = {
  navigation: { duration: APEXMOTION.duration.standard, easing: APEXMOTION.ease.standard },
  accordion: { duration: APEXMOTION.duration.relaxed, easing: APEXMOTION.ease.standard },
  press: { duration: APEXMOTION.duration.fast, easing: APEXMOTION.ease.standard },
  spatial: { duration: APEXMOTION.duration.relaxed, easing: APEXMOTION.ease.emphasized },
  feedback: { duration: APEXMOTION.duration.fast, easing: APEXMOTION.ease.standard },
  reveal: { duration: APEXMOTION.duration.standard, easing: APEXMOTION.ease.emphasized },
  continuity: { duration: APEXMOTION.duration.slow, easing: APEXMOTION.ease.emphasized },
};

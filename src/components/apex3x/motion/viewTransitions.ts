export type APEXViewTransitionName = 'apex3x-view' | `apex3x-entity-${string}`;

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => {
    finished: Promise<void>;
    ready: Promise<void>;
    updateCallbackDone: Promise<void>;
    skipTransition: () => void;
  };
};

export const supportsViewTransitions = () =>
  typeof document !== 'undefined' && typeof (document as ViewTransitionDocument).startViewTransition === 'function';

export const runAPEXViewTransition = (update: () => void | Promise<void>) => {
  if (!supportsViewTransitions()) {
    return Promise.resolve().then(update).then(() => undefined);
  }

  const transition = (document as ViewTransitionDocument).startViewTransition!(update);
  return transition.finished;
};

export const getEntityTransitionName = (entity: string, id: string | number) =>
  `apex3x-entity-${entity}-${String(id).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

export interface APEXFLIPSnapshot {
  element: HTMLElement;
  rect: DOMRect;
}

export const captureAPEXFLIP = (elements: Iterable<HTMLElement>): APEXFLIPSnapshot[] =>
  Array.from(elements, element => ({ element, rect: element.getBoundingClientRect() }));

export const playAPEXFLIP = (
  snapshots: APEXFLIPSnapshot[],
  duration = 240,
  easing = 'cubic-bezier(0.2, 0.8, 0.2, 1)',
) => {
  const animations: Animation[] = [];

  for (const { element, rect } of snapshots) {
    const next = element.getBoundingClientRect();
    const dx = rect.left - next.left;
    const dy = rect.top - next.top;
    const sx = next.width ? rect.width / next.width : 1;
    const sy = next.height ? rect.height / next.height : 1;

    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && Math.abs(sx - 1) < 0.005 && Math.abs(sy - 1) < 0.005) continue;

    animations.push(element.animate(
      [
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})` },
        { transform: 'translate3d(0, 0, 0) scale(1, 1)' },
      ],
      { duration, easing, fill: 'both' },
    ));
  }

  return animations;
};

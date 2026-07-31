// Rough organic CTR-by-position curve (industry-average, directional only — not a promise).
// Used to flag pages/queries underperforming their position, not as a precise target.
const CURVE = [
  [1, 0.28], [2, 0.15], [3, 0.11], [4, 0.08], [5, 0.06],
  [6, 0.045], [7, 0.035], [8, 0.03], [9, 0.025], [10, 0.02],
  [15, 0.012], [20, 0.008], [30, 0.004], [50, 0.002],
];

export function expectedCtr(avgPosition) {
  if (avgPosition <= CURVE[0][0]) return CURVE[0][1];
  for (let i = 1; i < CURVE.length; i++) {
    const [pos, ctr] = CURVE[i];
    if (avgPosition <= pos) {
      const [prevPos, prevCtr] = CURVE[i - 1];
      const t = (avgPosition - prevPos) / (pos - prevPos);
      return prevCtr + t * (ctr - prevCtr);
    }
  }
  return CURVE[CURVE.length - 1][1];
}

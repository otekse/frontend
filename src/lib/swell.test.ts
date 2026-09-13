import { describe, it } from "node:test";
import assert from "node:assert/strict";
// Explicit .ts extension: Node's ESM resolver does not do extension guessing.
import { LOOP, STRIP, swellPath } from "./swell.ts";

// The layers AlbumSection actually draws: [period, midline, depth, phase].
const LAYERS: [number, number, number, number][] = [
  [1200, 26, 32, 0],
  [1200, 62, 56, 420],
  [1200, 92, 64, 780],
  [600, 120, 66, 170],
];

type Segment = { x0: number; y0: number; pts: number[] };

/** The path's cubic segments, each with the point it starts from. */
function segments(d: string): Segment[] {
  const move = d.match(/^M(-?[\d.]+),(-?[\d.]+)/);
  assert.ok(move, "path starts with a move");
  let x0 = Number(move[1]);
  let y0 = Number(move[2]);
  const out: Segment[] = [];
  for (const m of d.matchAll(
    /C(-?[\d.]+),(-?[\d.]+) (-?[\d.]+),(-?[\d.]+) (-?[\d.]+),(-?[\d.]+)/g,
  )) {
    const pts = m.slice(1).map(Number);
    out.push({ x0, y0, pts });
    [x0, y0] = [pts[4], pts[5]];
  }
  return out;
}

describe("swellPath", () => {
  it("repeats exactly one loop later, so the animation restart is invisible", () => {
    for (const layer of LAYERS) {
      const segs = segments(swellPath(...layer));
      for (const s of segs.filter((seg) => seg.x0 < LOOP)) {
        const twin = segs.find((t) => t.x0 === s.x0 + LOOP);
        assert.ok(twin, `layer ${layer}: no segment ${LOOP} after x=${s.x0}`);
        assert.equal(twin.y0, s.y0);
        assert.deepEqual(
          twin.pts,
          s.pts.map((v, i) => (i % 2 === 0 ? v + LOOP : v)),
        );
      }
    }
  });

  it("spans the whole strip", () => {
    for (const layer of LAYERS) {
      const segs = segments(swellPath(...layer));
      assert.ok(segs[0].x0 <= 0);
      assert.ok(segs[segs.length - 1].pts[4] >= STRIP);
    }
  });

  it("stays smooth where one segment meets the next", () => {
    for (const layer of LAYERS) {
      const segs = segments(swellPath(...layer));
      for (let i = 0; i + 1 < segs.length; i++) {
        const [, , c2x, c2y, ex, ey] = segs[i].pts;
        const [n1x, n1y] = segs[i + 1].pts;
        // The incoming and outgoing handles are mirror images across the join.
        assert.deepEqual([ex - c2x, ey - c2y], [n1x - ex, n1y - ey]);
      }
    }
  });

  it("refuses a period that would make the loop jump", () => {
    assert.throws(() => swellPath(700, 26, 32, 0), /must divide 1200/);
  });
});

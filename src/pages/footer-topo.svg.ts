// Procedural contour map for the footer, emitted once as a cacheable static SVG
// (keeps ~90KB of path data out of every HTML page).
const W = 1440, H = 900;
const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function ring(cx: number, cy: number, r: number, seed: number, wob: number) {
  const N = 48, pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = 1 + wob * (Math.sin(a * 2 + seed) * 0.5 + Math.sin(a * 3 + seed * 1.7) * 0.3 + Math.sin(a * 5 + seed * 2.3) * 0.2);
    pts.push([cx + Math.cos(a) * r * 1.5 * k, cy + Math.sin(a) * r * 0.85 * k]);
  }
  const f = (n: number) => Math.round(n);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + 'Z';
}
const peaks = [{ x: 1080, y: 380, n: 13, s: 1 }, { x: 320, y: 620, n: 9, s: 4 }, { x: 760, y: 780, n: 7, s: 9 }];
const paths = peaks.flatMap((p) => Array.from({ length: p.n }, (_, i) => ring(p.x + rnd(i + p.s) * 6, p.y + rnd(i + p.s + 9) * 6, 26 + i * 40, p.s + i * 0.21, 0.09 + i * 0.012)));

export function GET() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#faf6e8" stroke-width="1" vector-effect="non-scaling-stroke">${paths.map((d) => `<path d="${d}"/>`).join('')}</g></svg>`;
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml' } });
}

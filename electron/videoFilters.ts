export function sanitizeCornerRadius(radius: number, width: number): number {
  const maxRadius = Math.max(0, Math.floor(width / 2) - 2);
  return Math.min(Math.max(0, Math.round(radius)), maxRadius);
}

function escapeFilterCommas(value: string): string {
  return value.replace(/,/g, '\\,');
}

function buildAlphaExpression(radius: number): string {
  const r = Math.round(radius);
  // Signed-distance rounded rect — stable single expression (nested if chains crash GIF / fail WebP).
  return `if(lte(hypot(max(${r}-X,max(X-W+${r}+1,0)),max(${r}-Y,max(Y-H+${r}+1,0))),0),255,0)`;
}

export function buildScaleFilter(fps: number, width: number): string {
  // accurate_rnd + full_chroma_int keep text/UI edges cleaner when downscaling.
  return `fps=${fps},scale=${width}:-2:flags=lanczos+accurate_rnd+full_chroma_int,setsar=1`;
}

export function buildCornerRadiusFilter(radius: number): string {
  if (radius <= 0) return '';

  const alpha = escapeFilterCommas(buildAlphaExpression(radius));
  return `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='${alpha}'`;
}

export function buildVideoFilter(
  fps: number,
  width: number,
  cornerRadius: number,
): string {
  const safeRadius = sanitizeCornerRadius(cornerRadius, width);
  const filters = [buildScaleFilter(fps, width)];
  const corners = buildCornerRadiusFilter(safeRadius);
  if (corners) filters.push(corners);
  return filters.join(',');
}

export function hasRoundedCorners(cornerRadius: number): boolean {
  return cornerRadius > 0;
}

import { useId, useLayoutEffect, useRef, type ReactNode } from 'react';

interface LiquidGlassPanelProps {
  children: ReactNode;
  className?: string;
}

const smoothStep = (start: number, end: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)));
  return t * t * (3 - 2 * t);
};

const roundedRectDistance = (
  x: number,
  y: number,
  halfWidth: number,
  halfHeight: number,
  radius: number,
) => {
  const qx = Math.abs(x) - halfWidth + radius;
  const qy = Math.abs(y) - halfHeight + radius;
  return (
    Math.min(Math.max(qx, qy), 0) +
    Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
    radius
  );
};

export function LiquidGlassPanel({ children, className = '' }: LiquidGlassPanelProps) {
  const reactId = useId();
  const filterId = `liquid-glass-${reactId.replace(/:/g, '')}`;
  const panelRef = useRef<HTMLElement>(null);
  const filterRef = useRef<SVGFilterElement>(null);
  const mapRef = useRef<SVGFEImageElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const filter = filterRef.current;
    const map = mapRef.current;
    const displacement = displacementRef.current;
    if (!panel || !filter || !map || !displacement) return;

    const updateMap = () => {
      const rect = panel.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const resolution = 0.5;
      const mapWidth = Math.max(1, Math.round(width * resolution));
      const mapHeight = Math.max(1, Math.round(height * resolution));
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.width = mapWidth;
      canvas.height = mapHeight;

      const pixels = context.createImageData(mapWidth, mapHeight);
      const maxDisplacement = 14;
      const edgeDepth = 34;
      const radius = 28;

      for (let y = 0; y < mapHeight; y += 1) {
        for (let x = 0; x < mapWidth; x += 1) {
          const cssX = (x + 0.5) / resolution;
          const cssY = (y + 0.5) / resolution;
          const centeredX = cssX - width / 2;
          const centeredY = cssY - height / 2;
          const signedDistance = roundedRectDistance(
            centeredX,
            centeredY,
            width / 2,
            height / 2,
            radius,
          );
          const distanceInside = Math.max(0, -signedDistance);
          const edgeStrength = 1 - smoothStep(0, edgeDepth, distanceInside);
          const centerDistance = Math.hypot(centeredX, centeredY) || 1;
          const offsetX = (-centeredX / centerDistance) * maxDisplacement * edgeStrength;
          const offsetY = (-centeredY / centerDistance) * maxDisplacement * edgeStrength;
          const pixelIndex = (y * mapWidth + x) * 4;

          pixels.data[pixelIndex] = Math.round(128 + (offsetX / maxDisplacement) * 127);
          pixels.data[pixelIndex + 1] = Math.round(128 + (offsetY / maxDisplacement) * 127);
          pixels.data[pixelIndex + 2] = 128;
          pixels.data[pixelIndex + 3] = 255;
        }
      }

      context.putImageData(pixels, 0, 0);
      const mapUrl = canvas.toDataURL('image/png');

      filter.setAttribute('x', '0');
      filter.setAttribute('y', '0');
      filter.setAttribute('width', String(width));
      filter.setAttribute('height', String(height));
      map.setAttribute('width', String(width));
      map.setAttribute('height', String(height));
      map.setAttribute('href', mapUrl);
      map.setAttributeNS('http://www.w3.org/1999/xlink', 'href', mapUrl);
      displacement.setAttribute('scale', String(maxDisplacement * 2));
    };

    updateMap();
    const observer = new ResizeObserver(updateMap);
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <svg className="liquid-glass-filters" aria-hidden="true" focusable="false">
        <defs>
          <filter
            ref={filterRef}
            id={filterId}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feImage ref={mapRef} preserveAspectRatio="none" result={`${filterId}-map`} />
            <feDisplacementMap
              ref={displacementRef}
              in="SourceGraphic"
              in2={`${filterId}-map`}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <section
        ref={panelRef}
        className={`${className} liquid-glass-panel`.trim()}
        style={{ backdropFilter: `url(#${filterId}) blur(0.6px) contrast(1.08) brightness(1.05) saturate(1.2)` }}
      >
        {children}
      </section>
    </>
  );
}

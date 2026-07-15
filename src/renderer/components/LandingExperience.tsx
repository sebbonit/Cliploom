import { useRef, type ReactNode } from 'react';
import lakeImage from '../assets/parallax-lake.jpg';
import cityImage from '../assets/parallax-city.jpg';
import desertImage from '../assets/parallax-desert.jpg';
import oceanImage from '../assets/parallax-ocean.jpg';
import forestImage from '../assets/parallax-forest.jpg';
import glassImage from '../assets/parallax-glass.jpg';

interface LandingExperienceProps {
  children: ReactNode;
}

export function LandingExperience({ children }: LandingExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
    container.style.setProperty('--parallax-x', `${x.toFixed(2)}px`);
    container.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
  };

  const resetParallax = () => {
    const container = containerRef.current;
    if (!container) return;
    container.style.setProperty('--parallax-x', '0px');
    container.style.setProperty('--parallax-y', '0px');
  };

  return (
    <div
      ref={containerRef}
      className="empty-state landing-experience"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
    >
      <div className="landing-backdrop" aria-hidden="true">
        <div className="backdrop-glow backdrop-glow-one" />
        <div className="backdrop-glow backdrop-glow-two" />

        <div className="backdrop-media backdrop-media-lake">
          <div className="backdrop-media-float">
            <img src={lakeImage} alt="" />
            <div className="backdrop-media-chrome">
              <span className="backdrop-play">▶</span>
              <span className="backdrop-progress"><i /></span>
              <span>00:18</span>
            </div>
          </div>
        </div>

        <div className="backdrop-media backdrop-media-city">
          <div className="backdrop-media-float">
            <img src={cityImage} alt="" />
            <div className="backdrop-media-chrome">
              <span className="backdrop-play">▶</span>
              <span className="backdrop-progress"><i /></span>
              <span>00:24</span>
            </div>
          </div>
        </div>

        <div className="backdrop-mini backdrop-mini-desert">
          <img src={desertImage} alt="" />
        </div>
        <div className="backdrop-mini backdrop-mini-ocean">
          <img src={oceanImage} alt="" />
        </div>
        <div className="backdrop-mini backdrop-mini-forest">
          <img src={forestImage} alt="" />
        </div>
        <div className="backdrop-mini backdrop-mini-glass">
          <img src={glassImage} alt="" />
        </div>

        <div className="backdrop-filmstrip">
          <span style={{ backgroundImage: `url(${cityImage})` }} />
          <span style={{ backgroundImage: `url(${lakeImage})` }} />
          <span style={{ backgroundImage: `url(${desertImage})` }} />
          <span style={{ backgroundImage: `url(${oceanImage})` }} />
          <span style={{ backgroundImage: `url(${forestImage})` }} />
          <span style={{ backgroundImage: `url(${glassImage})` }} />
        </div>
        <div className="backdrop-vignette" />
      </div>

      {children}
    </div>
  );
}

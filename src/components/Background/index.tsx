import { useEffect, useRef } from 'react';
import { GalaxyGenerator } from './galaxy';
import './style.css';
import { useGlobalSettings } from '@/context/GlobalSetting/context';

const Background = () => {
  const { theme } = useGlobalSettings();
  const galaxyRef = useRef<GalaxyGenerator>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const galaxy = new GalaxyGenerator(canvasRef.current);
      galaxy.onSetConfig({
        nebulaCount: 10,
        starCount: 120,
        globalAlpha: 0.4,
        minStarRadius: 0.5,
        maxStarRadius: 1.5,
        starSpeedFactor: 100,
        minStarAlpha: 0.25,
        minStarSizeFactor: 0.25,
        minInitialDist: 50,
        isReversed: false,
        mainColor: theme.base,
        sideColors: theme.colors
      })
      galaxy.onStart();
      galaxyRef.current = galaxy;
    }
    return () => {
      if (galaxyRef.current) {
        galaxyRef.current.destroy();
        galaxyRef.current = null;
      }
    }
  }, [])

  useEffect(() => {
    if (galaxyRef.current) {
      galaxyRef.current.setMainColor(theme.base);
      galaxyRef.current.setSideColors(theme.colors);
      galaxyRef.current.runForDuration(1000);
    }
  }, [theme])

  return (
    <div
      className="background"
      style={{
        position: 'fixed',
        height: 'calc(var(--vh, 1vh) * 100)',
        width: '100vw',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};

export default Background;
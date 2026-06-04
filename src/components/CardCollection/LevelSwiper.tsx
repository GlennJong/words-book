import { useCallback, useEffect } from 'react';
import useTouch from './useTouch';

type LevelSwiperProps = {
  disabled: boolean;
  upperLevel: (delta: number) => void;
};

const ACTIVE_Y = 120;

const LevelSwiper = ({ disabled, upperLevel }: LevelSwiperProps) => {
  const handleTouchMove = useCallback(function({ delta }: { delta?: number[] }) {
    if (!delta) return;
  }, []);

  const handleTouchEnd = ({ delta }: { delta?: number[] }) => {
    if (disabled && delta && Math.abs(delta[1]) > ACTIVE_Y) {
      const direction = delta[1] > 1 ? 'down' : 'up';
      disableTouch();
      if (direction === 'down') {
        upperLevel(1);
      } else if (direction === 'up') {
        upperLevel(-1);
      }
      enableTouch();
    }
  };

  const { disableTouch, enableTouch, destroy } = useTouch('#LevelSwiper', {
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  });

  useEffect(() => {
    return () => destroy();
  }, [destroy]);

  return <div id="LevelSwiper" style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' }} />;
};

export default LevelSwiper;

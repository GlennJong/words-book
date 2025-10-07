import { useCallback, useEffect } from 'react';
import useTouch from './useTouch';
import { useWordDataContext } from '@/context/WordData/context';
import { useGlobalSettings } from '@/context/GlobalSetting/context';

const ACTIVE_Y = 120;

const LevelSwiper = ({ disabled }: { disabled: boolean }) => {
  const { setTheme } = useGlobalSettings();
  const { level, upperLevel } = useWordDataContext();
  useEffect(() => {
    console.log(level)
    setTheme(`level_${level+1}` as "level_1" | "level_2" | "level_3" | "level_4" | "level_5" | "level_6");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  const handleTouchMove = useCallback(function({ delta }: { delta?: number[] }) {
    if (!delta) return;
    // cardMovingHandler(delta, coverRef.current, cardRef.current);
  }, []);

  const handleTouchEnd = ({ delta }: { delta?: number[] }) => {
    console.log({delta, disabled})
    
    if (disabled &&
        delta &&
        Math.abs(delta[1]) > ACTIVE_Y
      ) {
      
      const direction = delta[1] > 1 ? 'down' : 'up';

      console.log({direction})
      
      disableTouch();

      if (direction === 'down') {
        upperLevel(1);
      }
      else if (direction === 'up') {
        upperLevel(-1);
      }

      enableTouch();
    }
  };


  const { disableTouch, enableTouch, destroy } = useTouch("#LevelSwiper", {
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  })

  useEffect(() => {
    return () => destroy()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div id="LevelSwiper" style={{ position: 'absolute', top: '0', left: '0', right: '0', bottom: '0' }}>
    </div>
  )
};


export default LevelSwiper;
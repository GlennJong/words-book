import { useEffect, useRef } from "react";

interface TouchState {
  active: boolean;
  startAt?: number[];
  currentAt?: number[];
  delta?: number[];
}

interface useTouchProps {
  onTouchStart?: () => void;
  onTouchMove?: (props: TouchState) => void;
  onTouchEnd?: (props: TouchState) => void;
}

const useTouch = (selector: string, { onTouchStart, onTouchMove, onTouchEnd }: useTouchProps) => {
  const stateRef = useRef<TouchState>({
    active: true,
    startAt: undefined,
    currentAt: undefined,
    delta: undefined,
  });

  
  useEffect(() => {
    function handleTouchStart() {
      if (!stateRef.current.active) return;
      if (onTouchStart) onTouchStart();
    }

    function handleTouchMove(e: TouchEvent) {
      if (!stateRef.current.active) return;
  
      const touch = e.touches[0] || e.changedTouches[0];
      if (!stateRef.current.startAt) {
        stateRef.current.startAt = [touch.pageX, touch.pageY];
        stateRef.current.delta = [0, 0];
      }
      else {
        stateRef.current.delta = [
          touch.pageX - stateRef.current.startAt[0],
          touch.pageY - stateRef.current.startAt[1],
        ]
      }
      stateRef.current.currentAt = [touch.pageX, touch.pageY];
      if (onTouchMove) onTouchMove(stateRef.current);
    }
  
    function handleTouchEnd() {
      if (!stateRef.current.active) return;
      if (onTouchEnd) onTouchEnd(stateRef.current);
      stateRef.current.startAt = undefined;
      stateRef.current.delta = undefined;
    }
    
    const element = document.querySelector(selector) as HTMLElement | null;
    if (element) {
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);
      return () => {
        element.removeEventListener('touchstart', handleTouchStart);
        element.removeEventListener('touchmove', handleTouchStart);
        element.removeEventListener('touchend', handleTouchStart);
      }
    }

  }, [selector, onTouchEnd, onTouchMove, onTouchStart])

  return {
    disableTouch: () => stateRef.current.active = false,
    enableTouch: () => stateRef.current.active = true,
  }

}

export default useTouch;
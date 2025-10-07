import { useEffect, useRef } from "react";

interface TouchState {
  active: boolean;
  startAt?: number[];
  currentAt?: number[];
  delta?: number[];
}

type TouchCallback = ((e: TouchEvent) => void) | null;

interface useTouchProps {
  onTouchStart?: () => void;
  onTouchMove?: (props: TouchState) => void;
  onTouchEnd?: (props: TouchState) => void;
}

const useTouch = (selectorId: string, { onTouchStart, onTouchMove, onTouchEnd }: useTouchProps) => {
  const stateRef = useRef<TouchState>({
    active: true,
    startAt: undefined,
    currentAt: undefined,
    delta: undefined,
  });

  
  const handlersRef = useRef<{
    element: HTMLElement | null;
    handleTouchStart: TouchCallback;
    handleTouchMove: TouchCallback;
    handleTouchEnd: TouchCallback;
  }>({ element: null, handleTouchStart: null, handleTouchMove: null, handleTouchEnd: null });

  const getHandlers = () => ({
    handleTouchStart: () => {
      if (!stateRef.current.active) return;
      if (onTouchStart) onTouchStart();
    },
    handleTouchMove: (e: TouchEvent) => {
      if (!stateRef.current.active) return;
      const touch = e.touches[0] || e.changedTouches[0];
      if (!stateRef.current.startAt) {
        stateRef.current.startAt = [touch.pageX, touch.pageY];
        stateRef.current.delta = [0, 0];
      } else {
        stateRef.current.delta = [
          touch.pageX - stateRef.current.startAt[0],
          touch.pageY - stateRef.current.startAt[1],
        ];
      }
      stateRef.current.currentAt = [touch.pageX, touch.pageY];
      if (onTouchMove) onTouchMove(stateRef.current);
    },
    handleTouchEnd: () => {
      if (!stateRef.current.active) return;
      if (onTouchEnd) onTouchEnd(stateRef.current);
      stateRef.current.startAt = undefined;
      stateRef.current.delta = undefined;
    }
  });

  // 提取事件移除邏輯，避免重複
  function removeAllListeners(element: HTMLElement | null, handleTouchStart: TouchCallback, handleTouchMove: TouchCallback, handleTouchEnd: TouchCallback) {
    if (!element) return;
    if (handleTouchStart) element.removeEventListener('touchstart', handleTouchStart);
    if (handleTouchMove) element.removeEventListener('touchmove', handleTouchMove);
    if (handleTouchEnd) element.removeEventListener('touchend', handleTouchEnd);
  }

  useEffect(() => {
    const element = document.querySelector(selectorId) as HTMLElement | null;
    if (element) {
      const { handleTouchStart, handleTouchMove, handleTouchEnd } = getHandlers();
      element.addEventListener('touchstart', handleTouchStart);
      element.addEventListener('touchmove', handleTouchMove);
      element.addEventListener('touchend', handleTouchEnd);
      handlersRef.current = { element, handleTouchStart, handleTouchMove, handleTouchEnd };
      return () => {
        removeAllListeners(element, handleTouchStart, handleTouchMove, handleTouchEnd);
        handlersRef.current = { element: null, handleTouchStart: null, handleTouchMove: null, handleTouchEnd: null };
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectorId, onTouchEnd, onTouchMove, onTouchStart]);

  return {
    disableTouch: () => { stateRef.current.active = false; },
    enableTouch: () => { stateRef.current.active = true; },
    destroy: () => {
      stateRef.current.active = false;
      stateRef.current.startAt = undefined;
      stateRef.current.delta = undefined;
      const { element, handleTouchStart, handleTouchMove, handleTouchEnd } = handlersRef.current;
      removeAllListeners(element, handleTouchStart, handleTouchMove, handleTouchEnd);
      handlersRef.current = { element: null, handleTouchStart: null, handleTouchMove: null, handleTouchEnd: null };
    }
  };

}

export default useTouch;
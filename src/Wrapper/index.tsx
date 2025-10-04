function setVhVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVhVar();
window.addEventListener('resize', setVhVar);
window.addEventListener('orientationchange', setVhVar);

import { ReactNode } from 'react';

type WrapperProps = {
  id?: string;
  children: ReactNode;
};

const Wrapper = ({ id, children }: WrapperProps) => {
  return (
    <div id={id} style={{
      display: 'flex',
      height: 'calc(var(--vh, 1vh) * 100)',
      width: '100vw',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      { children }
    </div>
  );
}

export default Wrapper;
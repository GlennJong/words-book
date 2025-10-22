import { useCallback, useEffect, useRef, useState } from 'react';
import CardCover from './CardCover';
import CardBody from './CardBody';
import useTouch from '../useTouch';
import { useWordDataContext } from '@/context/WordData/context';
import FullScreenPanel from '@/components/FullScreenPanel';
import WordForm from '@/components/WordForm';
import { useGlobalSettings } from '@/context/GlobalSetting/context';

const CARD_ACTIVE_X = 100;
const CARD_ACTIVE_Y = 150;

const TRANSLATE_LIMITATION_X = 50;
const TRANSLATE_LIMITATION_Y = 50;
const TRANSLATE_RATIO = 0.5;
const ROTATE_LIMITATION = 50;
const ROTATE_RATIO = 0.1;
const TRANSITION_TIME = 300;

function cardMovingHandler(delta: number[], coverElement: HTMLElement, cardElement: HTMLElement) {
  coverElement.style.transition = 'none';
  coverElement.style.boxShadow = `
    inset
    ${delta[0] * -1}px
    ${delta[1] * -1}px
    ${((Math.abs(delta[0]) + Math.abs(delta[1]))) + 20}px
    ${delta[1] < 0 ?
      'hsla(30, 100%, 80%, 1)'
      :
      'hsla(200, 50%, 50%, 1)'
    }
  `;
  coverElement.style.opacity = `${
    (Math.abs(Math.min(Math.max(delta[0], -TRANSLATE_LIMITATION_X), TRANSLATE_LIMITATION_X)) +
    Math.abs(Math.min(Math.max(delta[1], -TRANSLATE_LIMITATION_Y), TRANSLATE_LIMITATION_Y))) /
    (TRANSLATE_LIMITATION_X + TRANSLATE_LIMITATION_Y)
    }
  `;
  coverElement.style.backgroundPosition = `
    ${Math.min(Math.max(50 + delta[0], 0), 100)}%,
    ${Math.min(Math.max(50 + delta[1], 0), 100)}%
  `;
  
  cardElement.style.transition = 'none';
  cardElement.style.transform = `
    translate(
      ${Math.min(Math.max(delta[0] * TRANSLATE_RATIO, -TRANSLATE_LIMITATION_X), TRANSLATE_LIMITATION_X)}px,
      ${Math.min(Math.max(delta[1] * TRANSLATE_RATIO, -TRANSLATE_LIMITATION_Y), TRANSLATE_LIMITATION_Y)}px
    )
    rotateY(${Math.min(Math.max(delta[0] * ROTATE_RATIO, -ROTATE_LIMITATION), ROTATE_LIMITATION)}deg)
    rotateX(${Math.min(Math.max(delta[1] * -ROTATE_RATIO, -ROTATE_LIMITATION), ROTATE_LIMITATION)}deg)
  `;
};

function cardResetStyleHandler(coverElement: HTMLElement, cardElement: HTMLElement, enableTransition: boolean = true) {
  coverElement.style.transition = enableTransition ? `all ${TRANSITION_TIME}ms ease-in-out` : 'none';
  coverElement.style.opacity = `0`;
  coverElement.style.boxShadow = `inset 0px 0px 0px hsla(30, 100%, 80%, 0)`;
  coverElement.style.backgroundPosition = `50% 50%`;

  cardElement.style.opacity = `1`;
  cardElement.style.transition = enableTransition ? 'transform 0.2s ease-in-out' : 'none';
  cardElement.style.transform = `translate(0px) rotateY(0deg) rotateX(0deg)`;
};

function cardAutoMoveoutStyleHandler(time: number = 300, direction: 'left' | 'right' | 'up' | 'down', cardElement: HTMLElement) {
  return new Promise<void>((resolve) => {
    cardElement.style.transition = `all ${time}ms ease`;
    if (direction === 'left' || direction === 'right') {
      cardElement.style.transform += ` translateX(${direction === 'left' ? '-100vw' : '100vw'})`;
    }
    else if (direction === 'up' || direction === 'down') {
      cardElement.style.transform += ` translateY(${direction === 'up' ? '-100vh' : '100vh'})`;
    }

    setTimeout(() => {
      cardElement.style.opacity = '0';
      resolve();
    }, time);
  })
}

function hintElementHandler(delta: number[], skipElement: HTMLElement, upgradeElement: HTMLElement, downgradeElement: HTMLElement) {
  const isSkip = Math.abs(delta[1]) > Math.abs(delta[0]) && delta[1] > 0;
  if (isSkip) {
    skipElement.style.opacity = '1';
    upgradeElement.style.opacity = '0';
    downgradeElement.style.opacity = '0';
  }
  else if (delta[0] > 0) {
    skipElement.style.opacity = '0';
    upgradeElement.style.opacity = '1';
    downgradeElement.style.opacity = '0';
  }
  else {
    skipElement.style.opacity = '0';
    upgradeElement.style.opacity = '0';
    downgradeElement.style.opacity = '1';
  }
}
function resetHintElementHandler(skipElement: HTMLElement, upgradeElement: HTMLElement, downgradeElement: HTMLElement) {
  skipElement.style.opacity = '0';
  upgradeElement.style.opacity = '0';
  downgradeElement.style.opacity = '0';
}

const WordCard = () => {
  const { data } = useWordDataContext();
  const { isOffline } = useGlobalSettings();
  const [ curIndex, setCurIndex ] = useState(0);
  // const [ nextIndex, setNextIndex ] = useState(1);
  const [ isUpdateWordOpen, setIsUpdateWordOpen ] = useState(false);
  // const { isOffline } = useGlobalSettings();
  const curIndexRef = useRef<number>(0);
  const skipGradientRef = useRef<HTMLDivElement>(null);
  const upgradeGradientRef = useRef<HTMLDivElement>(null);
  const downgradeGradientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (curIndex >= data.length && data.length > 0) {
      setCurIndex(0);
      curIndexRef.current = 0;
    }
  }, [data, curIndex]);
  const coverRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { update: updateWord } = useWordDataContext();
  
  const handleGoToNextCard = useCallback((func?: () => void) => {
    setCurIndex(prev => {
      let next = prev + 1;
      if (next >= data.length) next = 0;
      curIndexRef.current = next;
      if (func) {
        func();
      }
      return next;
    });
  }, [data])

  const handleCardTouchingStyle = useCallback(function({ delta }: { delta?: number[] }) {
    if (!cardRef.current || !coverRef.current || !delta) return;
    cardMovingHandler(delta, coverRef.current, cardRef.current);

    if (skipGradientRef.current && upgradeGradientRef.current && downgradeGradientRef.current) {
      if (Math.abs(delta[0]) > CARD_ACTIVE_X * 0.66 || Math.abs(delta[1]) > CARD_ACTIVE_Y * 0.66) {
        hintElementHandler(delta, skipGradientRef.current, upgradeGradientRef.current, downgradeGradientRef.current);
      }
      else {
        resetHintElementHandler(skipGradientRef.current, upgradeGradientRef.current, downgradeGradientRef.current);
      }
    }
  }, []);

  const handleCardUpgrade = () => {
    const current = data[curIndexRef.current];
    updateWord({...current, level: Math.min(5, current.level + 1)});
  }
  const handleCardDowngrade = () => {
    const current = data[curIndexRef.current];
    updateWord({...current, level: Math.max(0, current.level -1)});
  }
  
  const handleCardTouchEnd = useCallback(async function({ delta }: { delta?: number[] }) {
    if (delta && delta.length > 0 && (Math.abs(delta[0]) > CARD_ACTIVE_X || Math.abs(delta[1]) > CARD_ACTIVE_Y)) {
      
      if (!coverRef.current || !cardRef.current) return;
      
      const directionData = {
        horizontal: delta[0] > 0 ? 'right' : 'left',
        vertical: delta[1] > 1 ? 'down' : 'up'
      }
      const currentDirection = Math.abs(delta[0]) > Math.abs(delta[1]) ? 'horizontal' : 'vertical';
      const result = directionData[currentDirection] as 'left' | 'right' | 'up' | 'down';

      // card moving beheavior
      if (result === 'right') {
        handleCardUpgrade();
      }
      else if (result === 'left') {
        handleCardDowngrade();
      }
      
      disableTouch();
      
      await cardAutoMoveoutStyleHandler(TRANSITION_TIME, result, cardRef.current);
      
      handleGoToNextCard();
      
      // setTimeout(() => {
      //   if (coverRef.current && cardRef.current) {
      //     cardResetStyleHandler(coverRef.current, cardRef.current, false);
      //   }
      // }, 1000)
      
      enableTouch();
    }
    else {
      if (coverRef.current && cardRef.current) {
        cardResetStyleHandler(coverRef.current, cardRef.current, true);
      };
    }

    if (skipGradientRef.current && upgradeGradientRef.current && downgradeGradientRef.current) {
      resetHintElementHandler(skipGradientRef.current, upgradeGradientRef.current, downgradeGradientRef.current);
    }
  }, [handleGoToNextCard])

  const { disableTouch, enableTouch, destroy } = useTouch("#CardTouch", {
    onTouchMove: handleCardTouchingStyle,
    onTouchEnd: handleCardTouchEnd,
  });

  useEffect(() => {
    return () => {
      destroy();
    };
  }, [destroy]);

  const nextIndex = data.length > 1
  ? (curIndex === data.length - 1 ? 0 : curIndex + 1)
  : curIndex;

  const nextCard = data[nextIndex];
  const currentCard = data[curIndex];
  
  const isCardEmpty = data.length === 0;

  return (
    <>
      <div ref={skipGradientRef} style={{
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '360px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '3',
        mixBlendMode: 'hard-light',
        transition: 'opacity 0.2s ease-in-out',
        transform: 'translateY(60%)',
        backgroundImage: 'radial-gradient(#7ec29d 0%, rgba(126, 194, 157, .5) 22%,transparent 66%)',
        opacity: '0',
      }}>
        <div style={{
          position: 'relative',
          top: '-80px',
          fontFamily: 'Roboto Condensed',
          fontSize: '16px',
          color: 'hsla(0, 0%, 100%, 1)',
          textAlign: 'center',
        }}>Um...</div>
      </div>
      <div ref={downgradeGradientRef} style={{
        position: 'fixed',
        top: '0',
        left: '0',
        bottom: '0',
        width: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '3',
        mixBlendMode: 'hard-light',
        transition: 'opacity 0.2s ease-in-out',
        transform: 'translateX(-50%)',
        backgroundImage: 'radial-gradient(#8691bc 0%, rgba(141, 165, 200, 0.5) 22%,transparent 66%)',
        opacity: '0',
      }}>
        <div style={{
          position: 'relative',
          right: '-30px',
          fontFamily: 'Roboto Condensed',
          fontSize: '18px',
          color: 'hsla(0, 0%, 100%, 1)',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>Lost it</div>
      </div>
      <div ref={upgradeGradientRef} style={{
        position: 'fixed',
        top: '0',
        right: '0',
        bottom: '0',
        width: '320px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '3',
        mixBlendMode: 'hard-light',
        transition: 'opacity 0.2s ease-in-out',
        transform: 'translateX(50%)',
        backgroundImage: 'radial-gradient(#8691bc 0%, rgba(141, 165, 200, 0.5) 22%,transparent 66%)',
        opacity: '0',
      }}>
        <div style={{
          position: 'relative',
          left: '-30px',
          fontFamily: 'Roboto Condensed',
          fontSize: '18px',
          color: 'hsla(0, 0%, 100%, 1)',
          textAlign: 'center',
          whiteSpace: 'nowrap'
        }}>
          Get it
        </div>
      </div>
      <div id="CardTouch" style={{ position: 'relative' }}>
        {/* Front Card */}
        <div style={{ position: 'relative', zIndex: '2' }}>
          { isCardEmpty &&
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              opacity: "0.6",
              maxWidth: "75vw",
              maxHeight: "60vh",
              width: "300px",
              height: "450px",
            }}>
              No cards in this level.
            </div>
          }
          { !isCardEmpty && currentCard &&
            <CardWrapper3D key={curIndex}>
              <div ref={cardRef}>
                <CardCover ref={coverRef} />
                <CardBody
                  isEditable={!isOffline}
                  onEditClick={() => setIsUpdateWordOpen(true)}
                  level={currentCard.level}
                  word={currentCard.word}
                  description={currentCard.description}
                  instance={currentCard.instance}
                  translation={currentCard.translation}
                />
              </div>
            </CardWrapper3D>
          }
        </div>
        {/* Next Card */}
        { !isCardEmpty && nextCard &&
          <div style={{
              position: 'absolute',
              left: '0',
              top: '0',
              zIndex: '1',
              pointerEvents: 'none'
            }}>
            <CardBody
              level={nextCard.level}
              word={nextCard.word}
              description={nextCard.description}
              instance={nextCard.instance}
              translation={nextCard.translation}
            />
          </div>
        }
      </div>

      <FullScreenPanel open={isUpdateWordOpen} setOpen={setIsUpdateWordOpen}>
        <WordForm mode="edit" data={data[curIndex]} onConfirm={() => setIsUpdateWordOpen(false)} />
      </FullScreenPanel>
    </>
  )
};

const CardWrapper3D = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    perspective: '1106px',
    perspectiveOrigin: '50% 50%'
  }}>
    { children }
  </div>
)

export default WordCard;
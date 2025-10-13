import { useCallback, useEffect, useRef, useState } from 'react';
import CardCover from './CardCover';
import CardBody from './CardBody';
import useTouch from '../useTouch';
import { useWordDataContext } from '@/context/WordData/context';
import FullScreenPanel from '@/components/FullScreenPanel';
import WordForm from '@/components/WordForm';
import { useGlobalSettings } from '@/context/GlobalSetting/context';

const CARD_ACTIVE_X = 100;
const CARD_ACTIVE_Y = 100;

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
function resetElementHandler(skipElement: HTMLElement, upgradeElement: HTMLElement, downgradeElement: HTMLElement) {
  skipElement.style.opacity = '0';
  upgradeElement.style.opacity = '0';
  downgradeElement.style.opacity = '0';
}

const WordCard = () => {
  const { data } = useWordDataContext();
  const { isOffline, isDemo } = useGlobalSettings();
  const [ curIndex, setCurIndex ] = useState(0);
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
  
  const handleGoToNextCard = useCallback((func: () => void) => {
    setCurIndex(prev => {
      let next = prev + 1;
      if (next >= data.length) next = 0;
      curIndexRef.current = next;
      func();
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
        resetElementHandler(skipGradientRef.current, upgradeGradientRef.current, downgradeGradientRef.current);
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
      
      disableTouch();
      await cardAutoMoveoutStyleHandler(TRANSITION_TIME, result, cardRef.current);
      handleGoToNextCard(() => {
        if (coverRef.current && cardRef.current) {
          cardResetStyleHandler(coverRef.current, cardRef.current, false);
        }
      });
      // card moving beheavior
      if (result === 'right') {
        handleCardUpgrade();
      }
      else if (result === 'left') {
        handleCardDowngrade();
      }
      enableTouch();
    }
    else {
      if (coverRef.current && cardRef.current) {
        cardResetStyleHandler(coverRef.current, cardRef.current, true);
      };
    }

    if (skipGradientRef.current && upgradeGradientRef.current && downgradeGradientRef.current) {
      resetElementHandler(skipGradientRef.current, upgradeGradientRef.current, downgradeGradientRef.current);
    }
  }, [handleGoToNextCard])

  const { disableTouch, enableTouch } = useTouch("#CardTouch", {
    onTouchMove: handleCardTouchingStyle,
    onTouchEnd: handleCardTouchEnd,
  })

  const backIndex = data.length > 1
  ? (curIndex === data.length - 1 ? 0 : curIndex + 1)
  : curIndex;
  const backCard = data[backIndex];
  const frontCard = data[curIndex];
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
        zIndex: '2',
        mixBlendMode: 'hard-light',
        transition: 'opacity 0.2s ease-in-out',
        transform: 'translateY(60%)',
        backgroundImage: 'radial-gradient(#7ec29d 0%, rgba(126, 194, 157, .5) 22%,transparent 66%)',
        opacity: '0',
      }}>
        <div style={{
          position: 'relative',
          top: '-120px',
          fontFamily: 'Roboto Condensed',
          fontSize: '16px',
          color: 'hsla(0, 0%, 100%, 1)',
          textAlign: 'center',
        }}>It's on the tip of my tongue</div>
      </div>
      <div ref={downgradeGradientRef} style={{
        position: 'fixed',
        top: '0',
        left: '0',
        bottom: '0',
        width: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '2',
        mixBlendMode: 'hard-light',
        transition: 'opacity 0.2s ease-in-out',
        transform: 'translateX(-60%)',
        backgroundImage: 'radial-gradient(#3735ba 0%, rgba(77, 75, 215, .5) 22%,transparent 66%)',
        opacity: '0',
      }}>
        <div style={{
          position: 'relative',
          right: '-48px',
          fontFamily: 'Roboto Condensed',
          fontSize: '18px',
          color: 'hsla(0, 0%, 100%, 1)',
          textAlign: 'center',
          transform: 'rotate(90deg)',
          whiteSpace: 'nowrap'
        }}>My mind went blank</div>
      </div>
      <div ref={upgradeGradientRef} style={{
        position: 'fixed',
        top: '0',
        right: '0',
        bottom: '0',
        width: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: '2',
        mixBlendMode: 'hard-light',
        transition: 'opacity 0.2s ease-in-out',
        transform: 'translateX(60%)',
        backgroundImage: 'radial-gradient(#b013c8 0%, rgba(176, 19, 200, .5) 22%,transparent 66%)',
        opacity: '0',
      }}>
        <div style={{
          position: 'relative',
          left: '-48px',
          fontFamily: 'Roboto Condensed',
          fontSize: '18px',
          color: 'hsla(0, 0%, 100%, 1)',
          textAlign: 'center',
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap'
        }}>Totally get it</div>
      </div>
      <div id="CardTouch" style={{ position: 'relative' }}>
        {/* Front Card */}
        <div style={{ position: 'relative', zIndex: '1' }}>
          { isCardEmpty &&
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              opacity: "0.6",
              maxWidth: "65vw",
              maxHeight: "50vh",
              width: "300px",
              height: "450px",
            }}>
              No cards in this level.
            </div>
          }
          { !isCardEmpty && frontCard &&
            <CardWrapper3D>
              <div ref={cardRef}>
                <CardCover ref={coverRef} />
                <CardBody
                  isEditable={!isOffline && !isDemo}
                  level={frontCard.level}
                  word={frontCard.word}
                  description={frontCard.description}
                  instance={frontCard.instance}
                  translation={frontCard.translation}
                />
              </div>
            </CardWrapper3D>
          }
        </div>
        {/* Back Card */}
        { !isCardEmpty && backCard &&
          <div style={{
              position: 'absolute',
              left: '0',
              top: '0',
              zIndex: '0',
              pointerEvents: 'none'
            }}>
            <CardBody
              level={backCard.level}
              word={backCard.word}
              description={backCard.description}
              instance={backCard.instance}
              translation={backCard.translation}
            />
          </div>
        }
      </div>

      { !isOffline &&
        <button
          onClick={() => setIsUpdateWordOpen(true)}
        >
          ✎
        </button>
      }

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
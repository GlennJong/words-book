import { useEffect, useState } from 'react';
import FullScreenPanel from '../FullScreenPanel';
import WordForm from '../WordForm';
import { useWordDataContext } from '@/context/WordData/context';
import LoadingAnimation from '../LoadingAnimation';
import { useGlobalSettings } from '@/context/GlobalSetting/context';
import WordCard from './Card';
import LevelSwiper from './LevelSwiper';

const WordCollection = () => {
  const { isOffline, setTheme } = useGlobalSettings();
  const { isFetching, isLevelMode, setIsLevelMode, upperLevel, level, suffle } = useWordDataContext();

  useEffect(() => {
    setTheme(`level_${level+1}` as "level_1" | "level_2" | "level_3" | "level_4" | "level_5" | "level_6");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  // useEffect(() => {
  //   if (curIndex >= data.length && data.length > 0) {
  //     setCurIndex(0);
  //     curIndexRef.current = 0;
  //   }
  // }, [data, curIndex]);

  const [ isCreateNewWordOpen , setIsCreateNewWordOpen ] = useState(false);
  // const [ isUpdateWordOpen, setIsUpdateWordOpen ] = useState(false);

  return (
    <div style={{
        display: 'flex',
        gap: '5vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        overflow: 'hidden'
      }}
    >
      { isOffline &&
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', color: '#fff', fontSize: '12px' }}>
          offline
        </div>
      }
      { isFetching &&
        <div style={{ position: 'fixed', bottom: '24px', left: '16px', color: '#fff' }}>
          <LoadingAnimation />
        </div>
      }
      <LevelSwiper disabled={isLevelMode} />
      {/* Word Card */}
      <WordCard />
      <div style={{
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        right: '6px',
        bottom: '12px',
        zIndex: '99'
      }}>
        { isLevelMode &&
          <FancyRoundButton
            onClick={() => {
              upperLevel(1);
              // setCurIndex(0);
            }}>
            ⇮
          </FancyRoundButton>
        }
        <FancyRoundButton
          onClick={() => {
            setIsLevelMode(!isLevelMode);
            // setCurIndex(0);
          }}
          style={{fontSize: '12px'}}
        >
          { isLevelMode ? (level + 1) > 5 ? 'max': level+1 : 'mix' }
        </FancyRoundButton>
        { !isOffline &&
          <FancyRoundButton
            onClick={() => setIsCreateNewWordOpen(true)}
          >
            +
          </FancyRoundButton>
        }
        <FancyRoundButton
          onClick={() => suffle()}
        >
          ⟲
        </FancyRoundButton>
      </div>
      <FullScreenPanel open={isCreateNewWordOpen} setOpen={setIsCreateNewWordOpen}>
        <WordForm mode="create" onConfirm={() => setIsCreateNewWordOpen(false)} />
      </FullScreenPanel>
    </div>
  )
};

const FancyRoundButton = ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className="fancy-button rounded"
      // onTouchStart={(e) => e.currentTarget.classList.add('active')}
      // onTouchEnd={(e) => e.currentTarget.classList.remove('active')}
      { ...props }
    >
      { children }
    </button>
  )
}

export default WordCollection;
import { useEffect, useState } from 'react';
import FullScreenPanel from '../FullScreenPanel';
import WordForm from '../WordForm';
import { useWordDataContext } from '@/context/WordData/context';
import LoadingAnimation from '../LoadingAnimation';
import { useGlobalSettings } from '@/context/GlobalSetting/context';
import WordCard from './Card';
import LevelSwiper from './LevelSwiper';

const WordCollection = () => {
  const { isOffline, setTheme, theme } = useGlobalSettings();
  const { isFetching, isLevelMode, setIsLevelMode, upperLevel, level, suffle } = useWordDataContext();

  useEffect(() => {
    setTheme(`level_${level+1}` as "level_1" | "level_2" | "level_3" | "level_4" | "level_5" | "level_6");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  const [ isCreateNewWordOpen , setIsCreateNewWordOpen ] = useState(false);

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
            }}>
            ⇮
          </FancyRoundButton>
        }
        <button
          onClick={() => {
            setIsLevelMode(!isLevelMode);
          }}
          style={{
            width: '48px',
            height: '48px',
            border: '0',
            borderRadius: '50%',
            fontSize: '12px',
            fontFamily: 'Caprasimo',
            color: '#fff',
            background: isLevelMode ? `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]})` : '#111',
          }}
        >
          { isLevelMode ? (level + 1) > 5 ? 'max': level+1 : 'mix' }
        </button>
        { !isOffline &&
          <FancyRoundButton
            onClick={() => setIsCreateNewWordOpen(true)}
            style={{
              color: '#fff',
            }}
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
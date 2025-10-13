import { useEffect, useState } from 'react';
import FullScreenPanel from '../FullScreenPanel';
import WordForm from '../WordForm';
import { useWordDataContext } from '@/context/WordData/context';
import LoadingAnimation from '../LoadingAnimation';
import { useGlobalSettings } from '@/context/GlobalSetting/context';
import WordCard from './Card';
import LevelSwiper from './LevelSwiper';
import { OrbitButton, NormalButton } from './Button';

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
        display: 'flex',
        gap: '12px',
        position: 'fixed',
        bottom: '48px',
        left: '50%',
        transform: 'translateX(-50%)'
      }}>
        <NormalButton
          // disabled={isOffline}
          disabled={true}
          onClick={() => setIsCreateNewWordOpen(true)}
        >
          +
        </NormalButton>
        <OrbitButton
          onClick={() => {
            if (!isLevelMode) {
              setIsLevelMode(true);
            }
            if (level === 5) {
              setIsLevelMode(false);
            }
            if (isLevelMode) {
              upperLevel(1);
            }
          }}
          style={{ background: isLevelMode ? `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]}, ${theme.colors[2]})` : '#111' }}
        >
          { isLevelMode ? (level + 1) > 5 ? 'max': level+1 : 'mix' }
        </OrbitButton>
        <NormalButton
          onClick={() => suffle()}
        >
          ⟲
        </NormalButton>
      </div>
      <FullScreenPanel open={isCreateNewWordOpen} setOpen={setIsCreateNewWordOpen}>
        <WordForm mode="create" onConfirm={() => setIsCreateNewWordOpen(false)} />
      </FullScreenPanel>
    </div>
  )
};

export default WordCollection;
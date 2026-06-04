import { useState } from 'react';
import WordCollection from '@/components/WordCollection';
import PhraseCollection from '@/components/PhraseCollection';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Book } from '../../components/Icons/index';
import { useWordDataContext, WordDataProvider } from '@/context/WordData/context';
import { usePhraseDataContext, PhraseDataProvider } from '@/context/PhraseData/context';
import { useGlobalSettings } from '@/context/GlobalSetting/context';

function Main() {
  const [activeCollection, setActiveCollection] = useState<'word' | 'phrase'>('phrase');
  const { setEndpoint, setToken, setIsOffline } = useGlobalSettings();

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
    }}>
      <button
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          width: '48px',
          height: '48px',
          color: '#fff',
          fontSize: '12px',
          backgroundColor: 'transparent',
          border: '0',
          boxSizing: 'border-box',
          zIndex: '3',
        }}
        onClick={() => {
          setEndpoint(undefined);
          setToken(undefined);
          setIsOffline(false);
        }}
      >
        ⏎
      </button>

      <div style={{ position: 'fixed', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: '3' }}>
        <button
          style={{
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            background: activeCollection === 'word' ? 'rgba(255,255,255,0.12)' : 'transparent',
            padding: '10px 14px',
            borderRadius: '8px',
          }}
          onClick={() => setActiveCollection('word')}
        >
          Words
        </button>
        <button
          style={{
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            background: activeCollection === 'phrase' ? 'rgba(255,255,255,0.12)' : 'transparent',
            padding: '10px 14px',
            borderRadius: '8px',
          }}
          onClick={() => setActiveCollection('phrase')}
        >
          Phrases
        </button>
      </div>

      {activeCollection === 'word' ? (
        <WordDataProvider>
          <WordInterface />
        </WordDataProvider>
      ) : (
        <PhraseDataProvider>
          <PhraseInterface />
        </PhraseDataProvider>
      )}
    </div>
  );
}

const WordInterface = () => {
  const { isFetching, isFetchError, isFetched, refetch } = useWordDataContext();

  return (
    <>
      {isFetched ? (
        <WordCollection />
      ) : (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {isFetching && (
            <div>
              <LoadingAnimation />
            </div>
          )}
          {isFetchError && (
            <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center' }} onClick={refetch}>
              Error, Please try again...<br />
              🫠
            </div>
          )}
          {!isFetching && !isFetchError && (
            <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center', opacity: '0.4' }} onClick={refetch}>
              <Book style={{ width: '40px' }} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

const PhraseInterface = () => {
  const { isFetching, isFetchError, isFetched, refetch } = usePhraseDataContext();

  return (
    <>
      {isFetched ? (
        <PhraseCollection />
      ) : (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {isFetching && (
            <div>
              <LoadingAnimation />
            </div>
          )}
          {isFetchError && (
            <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center' }} onClick={refetch}>
              Error, Please try again...<br />
              🫠
            </div>
          )}
          {!isFetching && !isFetchError && (
            <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center', opacity: '0.4' }} onClick={refetch}>
              <Book style={{ width: '40px' }} />
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Main;

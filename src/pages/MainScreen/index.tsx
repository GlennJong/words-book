import WordCollection from '@/components/WordCollection';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Book } from '../../components/Icons/index';
import { useWordDataContext, WordDataProvider } from '@/context/WordData/context';
import { useGlobalSettings } from '@/context/GlobalSetting/context';

function Main() {
  const { setEndpoint, setToken, setIsOffline } = useGlobalSettings();
  
  return (
    <WordDataProvider>
      <div style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}>

          <button
            className="fancy-button rounded"
            style={{
              position: 'fixed',
              top: '12px',
              left: '12px',
              width: '48px',
              height: '48px',
              backgroundColor: 'transparent',
              border: '0',
              boxSizing: 'border-box',
            }}
            onClick={() => {
              setEndpoint(undefined)
              setToken(undefined)
              setIsOffline(false)
            }}
          >
            ⏎
          </button>
          
        <WordInterface />
      </div>
    </WordDataProvider>
  );
}


const WordInterface = () => {
  const { isFetching, isFetchError, isFetched, refetch } = useWordDataContext();

  return (
    <>
    { isFetched ?
      <WordCollection />
      :
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
        { isFetching &&
          <div>
            <LoadingAnimation />
          </div>
        }
        { isFetchError &&
          <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center' }} onClick={refetch}>
            Error, Please try again...<br />
            🫠
          </div>
        }
        { !isFetching && !isFetchError &&
          <div style={{ color: '#fff', fontSize: '12px', textAlign: 'center', opacity: '0.4' }} onClick={refetch}>
            <Book style={{ width: '40px' }} />
          </div>
        }
      </div>
    }
    </>
  )
}


export default Main;

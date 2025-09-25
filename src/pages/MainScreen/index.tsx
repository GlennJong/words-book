import WordCollection from '@/components/WordCollection';
import LoadingAnimation from '@/components/LoadingAnimation';
import { Book } from '../../components/Icons/index';
import { useWordDataContext, WordDataProvider } from '@/context/WordData/context';
import { useGlobalSettings } from '@/context/GlobalSetting/context';
import './backgrounds.css';

function Main() {
  const { setEndpoint, setToken } = useGlobalSettings();
  
  return (
    <WordDataProvider>
      <div className="pattern_3" style={{
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
            }}
          >
            ⏎
          </button>
          {/* <FullScreenPanel open={isPanelShow} setOpen={setIsPanelShow}>
          </FullScreenPanel> */}

          {/* Menu button */}
          {/* mini asturnout */}
          {/* create */}
          {/* update */}
          {/* mix mode */}

          {/* Level Selector */}
          {/* Slide up */}
          {/* Slide down */}

          {/* Updating Animation */}

          {/* Background Parallax */}
          {/* Level Theme */}
          {/* Level Transition */}

          
        <WordInterface />
      </div>
    </WordDataProvider>
  );
}


const WordInterface = () => {
  const { isFetching, isFetchError, isFetched, refetch } = useWordDataContext();

  console.log({isFetching, isFetchError, isFetched})

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

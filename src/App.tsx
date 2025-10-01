import MainScreen from './pages/MainScreen';
import { GlobalSettingsProvider, useGlobalSettings } from './context/GlobalSetting/context';
import { useState } from 'react';

function setVhVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVhVar();
window.addEventListener('resize', setVhVar);
window.addEventListener('orientationchange', setVhVar);

function App() {
  return (
    <GlobalSettingsProvider>
      <InnerApp />
    </GlobalSettingsProvider>
  );
}

const InnerApp = () => {
  const { isDemo, isOffline, endpoint, token } = useGlobalSettings();
  return (
    <div id="App" style={{
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
      {/* // TODO: demo mode */}
      { (isDemo || isOffline) ?
        <MainScreen />
        :
        (endpoint && token) ? <MainScreen /> : <KeyInputer />
      }
    </div>
  );
}

const KeyInputer = () => {
  const { setEndpoint, setToken, setIsOffline } = useGlobalSettings();
  const [ endpointInput, setEndpointInput ] = useState<string>('');
  const [ tokenInput, setTokenInput ] = useState<string>('');
  
  return (
    <div className="pattern_3" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}>
      <input
        placeholder="Input Endpoint"
        value={endpointInput}
        onChange={e => setEndpointInput(e.target.value)}
        style={{ padding: '8px' }}
      />
      <input
        placeholder="Input Token"
        value={tokenInput}
        onChange={e => setTokenInput(e.target.value)}
        style={{ padding: '8px' }}
      />
      
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className='fancy-button' onClick={() => {
          setEndpoint(endpointInput)
          setToken(tokenInput)
          setIsOffline(false)
        }}>
          START
        </button>
        <button className='fancy-button' onClick={() => setIsOffline(true)}>
          OFFLINE
        </button>
      </div>
    </div>
  );
}

export default App;
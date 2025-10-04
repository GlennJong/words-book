import MainScreen from './pages/MainScreen';
import { GlobalSettingsProvider, useGlobalSettings } from './context/GlobalSetting/context';
import { useState } from 'react';
import Wrapper from './Wrapper';
import Background from './components/Background';

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
    <Wrapper id="App">
      <>
        <Background />
        {/* // TODO: demo mode */}
        { (isDemo || isOffline) ?
          <MainScreen />
          :
          (endpoint && token) ? <MainScreen /> : <KeyInputer />
        }
      </>
    </Wrapper>
  );
}

const KeyInputer = () => {
  const { setEndpoint, endpoint, token, setToken, setIsOffline } = useGlobalSettings();
  const [ endpointInput, setEndpointInput ] = useState<string>(endpoint || '');
  const [ tokenInput, setTokenInput ] = useState<string>(token || '');

  console.log({endpoint, token});
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}>
      <input
        id="endpoint"
        placeholder="Input Endpoint"
        value={endpointInput}
        onChange={e => setEndpointInput(e.target.value)}
        style={{ padding: '8px', zIndex: 1 }}
      />
      <input
        id="token"
        placeholder="Input Token"
        value={tokenInput}
        onChange={e => setTokenInput(e.target.value)}
        style={{ padding: '8px', zIndex: 1}}
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
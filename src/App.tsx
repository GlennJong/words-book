import MainScreen from './pages/MainScreen';
import { GlobalSettingsProvider, useGlobalSettings } from './context/GlobalSetting/context';

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
  const { isDemo, endpoint, token } = useGlobalSettings();
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
      { isDemo ?
        <MainScreen />
        :
        (endpoint && token) ? <MainScreen /> : <KeyInputer />
      }
    </div>
  );
}

const KeyInputer = () => {
  const { setEndpoint, setToken } = useGlobalSettings();
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
        onBlur={e => setEndpoint(e.target.value)}
        style={{ padding: '8px' }}
      />
      <input
        placeholder="Input Token"
        onBlur={e => setToken(e.target.value)}
        style={{ padding: '8px' }}
      />
    </div>
  );
}

export default App;
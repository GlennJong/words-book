import MainScreen from './pages/MainScreen';
import { GlobalSettingsProvider, useGlobalSettings } from './context/GlobalSetting/context';
import { useEffect } from 'react';

// set --vh to prevent been reset by iOS mobile keyboard
function useVhFix() {
  useEffect(() => {
    function setVh() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setVh();
    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);
}

function App() {
  useVhFix();
  return (
    <GlobalSettingsProvider>
      <InnerApp />
    </GlobalSettingsProvider>
  );
}

const InnerApp = () => {
  const { asId } = useGlobalSettings();
  return (
    <div id="App" style={{
      display: 'flex',
      height: 'calc(var(--vh, 1vh) * 100)',
      width: '100vw',
      overflow: 'hidden',
    }}>
      { asId ? <MainScreen /> : <IdInputer /> }
    </div>
  );
}

const IdInputer = () => {
  const { setAsId } = useGlobalSettings();
  return (
    <div className="pattern_3" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}>
      <input
        placeholder="Input your id"
        onBlur={e => setAsId(e.target.value)}
        style={{ padding: '8px' }}
      />
    </div>
  );
}

export default App;
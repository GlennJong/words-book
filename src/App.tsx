import MainScreen from './pages/MainScreen';
import { GlobalSettingsProvider, useGlobalSettings } from './context/GlobalSetting/context';


function App() {

  return (
    <GlobalSettingsProvider>
      <InnerApp />
    </GlobalSettingsProvider>
  )
}

const InnerApp = () => {
  const { asId } = useGlobalSettings();
  return (
    <div id="App" style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
    }}>
      { asId ?
        <MainScreen />
        :
        <IdInputer />
      }
    </div>
  )
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
  )
}

export default App
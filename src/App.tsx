import { createContext, useContext, useState } from 'react';
import MainScreen from './pages/MainScreen';

// 擴充 context 型別
type GlobalSetting = {
  asId: string | undefined;
  setAsId: (value: string | undefined) => void;
  theme: string;
  setTheme: (theme: string) => void;
  // 其他環境變數可在此擴充
};

export const GlobalSettingContext = createContext<GlobalSetting>({
  asId: undefined,
  setAsId: () => {},
  theme: 'light',
  setTheme: () => {},
});

export const useGlobalSetting = () => useContext(GlobalSettingContext);

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() ?? undefined;
}

function getAsIdFromUrlOrCookie(): string | undefined {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get('as_id');
  if (value) {
    document.cookie = `as_id=${value}; path=/; max-age=31536000;`;
    return value;
  }
  return getCookie('as_id');
}

function App() {
  const [asId, setAsId] = useState<string | undefined>(getAsIdFromUrlOrCookie());
  const [theme, setTheme] = useState('light');

  return (
    <GlobalSettingContext.Provider value={{
      asId,
      setAsId: (value) => {
        if (typeof value === 'undefined') {
          document.cookie = ``;
          setAsId(undefined);
        } else {
          document.cookie = `as_id=${value}; path=/; max-age=31536000;`;
          setAsId(value);
        }
      },
      theme,
      setTheme,
    }}>
      <div id="App" style={{
        display: 'flex',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}>
        { asId ?
          <MainScreen />
          :
          <AppIdInputer />
        }
      </div>
    </GlobalSettingContext.Provider>
  )
}

const AppIdInputer = () => {
  const { setAsId } = useGlobalSetting();
  // 這裡可加 input 讓使用者輸入 asId
  return (
    <div className="pattern_3" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
    }}>
      <input
        placeholder="請輸入 asId"
        onBlur={e => setAsId(e.target.value)}
        style={{ fontSize: '1.2em', padding: '8px' }}
      />
    </div>
  )
}

export default App
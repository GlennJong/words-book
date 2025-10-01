import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './global.css';

const isDev = import.meta.env.VITE_IS_DEV;

createRoot(document.getElementById('root')!).render(
  isDev ?
    <App /> :
  <StrictMode>
    <App />
  </StrictMode>,
)

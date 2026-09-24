import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { configMissing } from './lib/firebase';
import { ConfigMissing } from './components/Common';
import Display from './views/Display';
import Host from './views/Host';
import Play from './views/Play';

function App() {
  if (configMissing) return <ConfigMissing />;
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/display') return <Display />;
  if (path === '/host') return <Host />;
  if (path !== '/play') window.history.replaceState(null, '', '/play');
  return <Play />;
}

createRoot(document.getElementById('root')).render(<App />);

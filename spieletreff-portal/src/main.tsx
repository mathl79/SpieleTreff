import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // Import HashRouter instead
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter> {/* Use HashRouter instead of BrowserRouter */}
      <App />
    </HashRouter>
  </StrictMode>,
);

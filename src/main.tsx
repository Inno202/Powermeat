import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// GitHub Pages cannot send a header that forbids framing, so the page refuses to run
// inside another site's frame (protects against click-jacking).
if (window.top !== window.self) {
  try {
    window.top!.location.href = window.self.location.href;
  } catch {
    document.documentElement.innerHTML = '';
  }
  throw new Error('Framing is not allowed');
}

createRoot(document.getElementById('root')!).render(<App />);

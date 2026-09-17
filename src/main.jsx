import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { formatDateEs } from './lib/api';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if (location.search.includes('selftest')) {
  const d = formatDateEs(new Date(2027, 0, 1));
  console.assert(d === '01/01/2027', 'formatDateEs failed:', d);
  console.log('selftest done');
}

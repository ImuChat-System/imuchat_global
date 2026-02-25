import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { I18nProvider } from './providers/I18nProvider';
import { ImuChatProvider } from './providers/ImuChatProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ImuChatProvider appId="imu-contests">
      <I18nProvider>
        <App />
      </I18nProvider>
    </ImuChatProvider>
  </React.StrictMode>,
);

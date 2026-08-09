import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/sonner.jsx';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
      <Provider store={store}>
            <BrowserRouter>
                  <HelmetProvider>
                        <App />
                        <Toaster />
                  </HelmetProvider>
            </BrowserRouter>
      </Provider>
);
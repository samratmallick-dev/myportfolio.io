import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from './components/ui/sonner.jsx';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { ensureAuthInitialized } from './store/auth.slice';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './components/common/theme-provider';
ensureAuthInitialized(store.dispatch);

createRoot(document.getElementById('root')).render(
      <Provider store={store}>
            <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  storageKey="theme"
            >
                  <BrowserRouter>
                        <HelmetProvider>
                              <App />
                              <Toaster />
                        </HelmetProvider>
                  </BrowserRouter>
            </ThemeProvider>
      </Provider>
);

if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
            navigator.serviceWorker.register("/sw.js").catch(() => {
                  /* Registration is best-effort; the app works fully online without it. */
            });
      });
}
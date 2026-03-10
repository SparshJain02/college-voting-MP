import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import store from './app/store'
import { Provider } from 'react-redux'
import App from './App.jsx'
import { BrowserRouter } from 'react-router'
import {QueryClient,QueryClientProvider} from "@tanstack/react-query"

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
    </BrowserRouter>
  </StrictMode>,
)

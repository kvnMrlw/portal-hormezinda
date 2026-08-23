import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './styles/globals.css';
import './styles/reference-v10.css';

const queryClient = new QueryClient();
console.info('[Portal Hormezinda] Milestone 17 Visual V10 Living Campus carregada');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

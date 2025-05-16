import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx' 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>  {/* Wrap App with AuthProvider */}
      <QueryClientProvider client={queryClient}>
      <App />
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)

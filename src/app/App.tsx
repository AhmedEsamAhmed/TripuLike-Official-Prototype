import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { router } from './routes';
import MarketplaceDebugPanel from './components/MarketplaceDebugPanel';

export default function App() {
  return (
    <AppProvider>
      <div className="antialiased">
        <RouterProvider router={router} />
        <MarketplaceDebugPanel />
      </div>
    </AppProvider>
  );
}

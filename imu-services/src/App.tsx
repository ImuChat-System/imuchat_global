import { useState } from 'react';
import { useImuChat } from './providers/ImuChatProvider';
import { NavigationProvider, useNavigation } from './hooks/use-navigation';

// Hub pages — migrated components
import ImuServicesHub from './pages/ImuServicesHub';

/**
 * ImuServices — Mini-app router.
 */
function AppContent() {
  const [currentRoute, setCurrentRoute] = useState('/');
  const { isConnected } = useImuChat();

  const navigate = (path: string) => setCurrentRoute(path);
  const goBack = () => setCurrentRoute('/');

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  
  // Route matching  
  const renderPage = () => {
    const parts = currentRoute.split('/').filter(Boolean);
    if (parts.length === 1 && parts[0] === 'favorites') {
      // TODO: return <FavoritesPage />;
      return <div className="p-6"><h2>favorites</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 1 && parts[0] === 'emergency') {
      // TODO: return <EmergencyPage />;
      return <div className="p-6"><h2>emergency</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 1 && parts[0] === 'book') {
      // TODO: return <BookPage />;
      return <div className="p-6"><h2>book</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 1 && parts[0] === 'partners') {
      // TODO: return <PartnersPage />;
      return <div className="p-6"><h2>partners</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 1 && parts[0] === 'requests') {
      // TODO: return <RequestsPage />;
      return <div className="p-6"><h2>requests</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 1 && parts[0] === 'settings') {
      // TODO: return <SettingsPage />;
      return <div className="p-6"><h2>settings</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 2 && parts[0] === 'pro' && parts[1] !== undefined) {
      // TODO: return <ProProIdPage />;
      return <div className="p-6"><h2>pro/:proId</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 1 && parts[0] !== undefined) {
      // TODO: return <CategoryPage />;
      return <div className="p-6"><h2>:category</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    // Default: Hub
    return null;
  };

  const subPage = renderPage();
  if (subPage) return (<>
        {subPage}
      </>);

  return (
    <>
      
      <ImuServicesHub onNavigate={navigate} currentRoute={currentRoute} onBack={goBack} />
    </>
  );
}

export default function App() {
  return (
    <NavigationProvider>
      
      <AppContent />
      
    </NavigationProvider>
  );
}

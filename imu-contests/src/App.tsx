import { useState } from 'react';
import { useImuChat } from './providers/ImuChatProvider';
import { NavigationProvider, useNavigation } from './hooks/use-navigation';

// Hub pages — migrated components
import ImuContestsHub from './pages/ImuContestsHub';

/**
 * ImuContests — Mini-app router.
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
    if (parts.length === 1 && parts[0] === 'archive') {
      // TODO: return <ArchivePage />;
      return <div className="p-6"><h2>archive</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
    }
    if (parts.length === 1 && parts[0] !== undefined) {
      // TODO: return <ContestIdPage />;
      return <div className="p-6"><h2>:contestId</h2><button onClick={goBack} className="text-primary underline">← Retour</button></div>;
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
      
      <ImuContestsHub onNavigate={navigate} currentRoute={currentRoute} onBack={goBack} />
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

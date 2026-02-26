import { useImuChat } from './providers/ImuChatProvider';
import AdminPage from './pages/AdminPage';

export default function App() {
  const { isConnected } = useImuChat();

  if (!isConnected) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return <AdminPage />;
}

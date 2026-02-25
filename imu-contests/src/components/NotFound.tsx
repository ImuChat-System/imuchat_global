import { useNavigation } from '@/hooks/use-navigation';

export function NotFound() {
  const { goBack } = useNavigation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold text-foreground">Page non trouvée</h2>
      <p className="text-muted-foreground">La ressource demandée n'existe pas.</p>
      <button
        onClick={goBack}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Retour
      </button>
    </div>
  );
}

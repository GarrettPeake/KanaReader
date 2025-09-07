import { GameProvider } from './context';
import { 
  MainGame, 
  Header, 
  Footer, 
  SideMenu, 
  LevelTransition, 
  LevelSetTransition,
  ErrorBoundary 
} from './components';
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { useGameContext } from './hooks/useGameContext';
import { LEVEL_SETS } from './data';
import './styles/globals.css';

function AppContent() {
  const { state, dispatch, isLoaded } = useGameContext();
  
  // Check if user has no progress (first time visitor)  
  // Only show welcome screen if we're loaded and certain there's no progress
  const hasNoProgress = isLoaded && 
                        state.currentLevelSetId === '' && 
                        state.unlockedCharacters.size === 0 && 
                        state.completedLevels.size === 0;

  const handleStartLearning = () => {
    // Start with the first level set (katakana)
    const katakanaLevelSet = LEVEL_SETS.find(set => set.id === 'katakana');
    const firstCharacter = katakanaLevelSet?.characterMappings[0];
    dispatch({ 
      type: 'ADVANCE_LEVEL_SET', 
      payload: { 
        levelSetId: 'katakana',
        firstCharacter: firstCharacter 
      } 
    });
  };

  // Show loading until we know the progress state
  if (!isLoaded) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh',
          color: '#e2e8f0'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (hasNoProgress) {
    return (
      <div className="app">
        <WelcomeScreen onStart={handleStartLearning} />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <MainGame />
        <SideMenu />
        <LevelTransition />
        <LevelSetTransition />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </ErrorBoundary>
  );
}

export default App;
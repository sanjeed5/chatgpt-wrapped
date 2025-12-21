import { useEffect } from 'react';
import { AppProvider } from './store/AppContext';
import { StoryContainer } from './components/StoryContainer';

function AppContent() {
  // Set viewport height CSS variable
  useEffect(() => {
    const updateHeight = () => {
      document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    };
    
    updateHeight();
    window.addEventListener('resize', updateHeight);
    window.addEventListener('orientationchange', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
      window.removeEventListener('orientationchange', updateHeight);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Desktop background */}
      <div className="fixed inset-0 hidden md:block bg-gradient-to-br from-gray-900 via-black to-gray-900" />
      
      {/* Main container */}
      <StoryContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

import { createContext, useContext, useReducer, type ReactNode, type Dispatch } from 'react';
import type { Stats, SlideType } from '../types';

interface AppState {
  currentSlide: number;
  stats: Stats | null;
  isDemo: boolean;
  isPaused: boolean;
  error: string | null;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STATS'; payload: { stats: Stats; isDemo: boolean } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'GO_TO_SLIDE'; payload: number }
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREV_SLIDE' }
  | { type: 'SET_PAUSED'; payload: boolean }
  | { type: 'RESET' };

const initialState: AppState = {
  currentSlide: 0,
  stats: null,
  isDemo: false,
  isPaused: false,
  error: null,
  isLoading: false,
};

// Slides order when we have stats
export const DATA_SLIDES: SlideType[] = [
  'journey',
  'intro',
  'growth',
  'biggest-month',
  'streak',
  'peak',
  'model',
  'politeness',
  'persona',
  'words',
  'roast',
  'summary',
];

export const STATIC_SLIDES: SlideType[] = ['upload', 'loading', 'error'];

export function getSlideCount(hasStats: boolean, stats: Stats | null): number {
  if (!hasStats || !stats) return STATIC_SLIDES.length;
  
  // Filter out growth slide if no previous year data
  let dataSlides = [...DATA_SLIDES];
  if (!stats.previousYearConversations || stats.previousYearConversations === 0) {
    dataSlides = dataSlides.filter(s => s !== 'growth');
  }
  
  return STATIC_SLIDES.length + dataSlides.length;
}

export function getActiveDataSlides(stats: Stats | null): SlideType[] {
  if (!stats) return [];
  
  let slides = [...DATA_SLIDES];
  if (!stats.previousYearConversations || stats.previousYearConversations === 0) {
    slides = slides.filter(s => s !== 'growth');
  }
  
  return slides;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'SET_STATS':
      return {
        ...state,
        stats: action.payload.stats,
        isDemo: action.payload.isDemo,
        isLoading: false,
        error: null,
        currentSlide: 3, // First data slide (after upload, loading, error)
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        currentSlide: 2, // Error slide
      };
    
    case 'GO_TO_SLIDE':
      return { ...state, currentSlide: action.payload };
    
    case 'NEXT_SLIDE': {
      const totalSlides = getSlideCount(!!state.stats, state.stats);
      const nextSlide = Math.min(state.currentSlide + 1, totalSlides - 1);
      return { ...state, currentSlide: nextSlide };
    }
    
    case 'PREV_SLIDE': {
      // If on first data slide (3), go back to upload (0)
      if (state.currentSlide === 3) {
        return { ...state, currentSlide: 0 };
      }
      // If on error slide (2), go back to upload (0)
      if (state.currentSlide === 2) {
        return { ...state, currentSlide: 0 };
      }
      const prevSlide = Math.max(state.currentSlide - 1, 3);
      return { ...state, currentSlide: prevSlide };
    }
    
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };
    
    case 'RESET':
      return initialState;
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

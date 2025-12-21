import { useCallback, useEffect } from 'react';
import { useApp, getSlideCount, getActiveDataSlides, STATIC_SLIDES } from '../store/AppContext';
import { ProgressBar } from './ui/ProgressBar';

// Static slides
import { UploadSlide } from './slides/UploadSlide';
import { LoadingSlide } from './slides/LoadingSlide';
import { ErrorSlide } from './slides/ErrorSlide';

// Data slides
import { JourneySlide } from './slides/JourneySlide';
import { IntroSlide } from './slides/IntroSlide';
import { GrowthSlide } from './slides/GrowthSlide';
import { BiggestMonthSlide } from './slides/BiggestMonthSlide';
import { StreakSlide } from './slides/StreakSlide';
import { PeakSlide } from './slides/PeakSlide';
import { ModelSlide } from './slides/ModelSlide';
import { PolitenessSlide } from './slides/PolitenessSlide';
import { PersonaSlide } from './slides/PersonaSlide';
import { WordsSlide } from './slides/WordsSlide';
import { RoastSlide } from './slides/RoastSlide';
import { SummarySlide } from './slides/SummarySlide';

const SLIDE_DURATION = 5000;

export function StoryContainer() {
  const { state, dispatch } = useApp();
  const { currentSlide, stats, isPaused } = state;
  
  const totalSlides = getSlideCount(!!stats, stats);
  const activeDataSlides = getActiveDataSlides(stats);
  
  // Determine if we're on a data slide (not upload, loading, error, or summary)
  const isDataSlide = currentSlide >= 3 && currentSlide < totalSlides - 1;
  const isSummarySlide = currentSlide === totalSlides - 1 && !!stats;
  
  const handleNext = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      dispatch({ type: 'NEXT_SLIDE' });
    }
  }, [currentSlide, totalSlides, dispatch]);
  
  const handlePrev = useCallback(() => {
    dispatch({ type: 'PREV_SLIDE' });
  }, [dispatch]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);
  
  // Hold to pause
  const handleMouseDown = useCallback(() => {
    dispatch({ type: 'SET_PAUSED', payload: true });
  }, [dispatch]);
  
  const handleMouseUp = useCallback(() => {
    dispatch({ type: 'SET_PAUSED', payload: false });
  }, [dispatch]);
  
  // Get current data slide index (relative to data slides)
  const getCurrentDataSlideType = () => {
    if (!stats || currentSlide < STATIC_SLIDES.length) return null;
    const dataSlideIndex = currentSlide - STATIC_SLIDES.length;
    return activeDataSlides[dataSlideIndex];
  };
  
  const currentDataSlideType = getCurrentDataSlideType();
  
  return (
    <main
      className="relative w-full max-w-[430px] mx-auto h-[var(--app-height,100vh)] bg-black overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Progress Bars */}
      {stats && currentSlide >= 3 && (
        <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 px-2 py-3">
          {activeDataSlides.map((slideType, idx) => {
            const slideIndex = idx + STATIC_SLIDES.length;
            return (
              <ProgressBar
                key={slideType}
                isActive={currentSlide === slideIndex}
                isCompleted={currentSlide > slideIndex}
                duration={SLIDE_DURATION}
                isPaused={isPaused}
                onComplete={slideIndex < totalSlides - 1 ? handleNext : undefined}
              />
            );
          })}
        </div>
      )}
      
      {/* Navigation Tap Zones */}
      {isDataSlide && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-0 top-0 w-1/3 h-full z-40 cursor-pointer"
            aria-label="Previous slide"
          />
          <button
            onClick={handleNext}
            className="absolute right-0 top-0 w-1/3 h-full z-40 cursor-pointer"
            aria-label="Next slide"
          />
        </>
      )}
      
      {/* Static Slides */}
      <UploadSlide isActive={currentSlide === 0} />
      <LoadingSlide isActive={currentSlide === 1} />
      <ErrorSlide isActive={currentSlide === 2} />
      
      {/* Data Slides */}
      {stats && (
        <>
          <JourneySlide isActive={currentDataSlideType === 'journey'} stats={stats} />
          <IntroSlide isActive={currentDataSlideType === 'intro'} stats={stats} />
          {stats.previousYearConversations > 0 && (
            <GrowthSlide isActive={currentDataSlideType === 'growth'} stats={stats} />
          )}
          <BiggestMonthSlide isActive={currentDataSlideType === 'biggest-month'} stats={stats} />
          <StreakSlide isActive={currentDataSlideType === 'streak'} stats={stats} />
          <PeakSlide isActive={currentDataSlideType === 'peak'} stats={stats} />
          <ModelSlide isActive={currentDataSlideType === 'model'} stats={stats} />
          <PolitenessSlide isActive={currentDataSlideType === 'politeness'} stats={stats} />
          <PersonaSlide isActive={currentDataSlideType === 'persona'} stats={stats} />
          <WordsSlide isActive={currentDataSlideType === 'words'} stats={stats} />
          <RoastSlide isActive={currentDataSlideType === 'roast'} stats={stats} />
          <SummarySlide isActive={currentDataSlideType === 'summary'} stats={stats} />
        </>
      )}
    </main>
  );
}

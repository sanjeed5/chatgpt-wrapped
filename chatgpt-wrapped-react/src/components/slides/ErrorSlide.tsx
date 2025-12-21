import { SlideWrapper } from './SlideWrapper';
import { Button } from '../ui/Button';
import { useApp } from '../../store/AppContext';

interface ErrorSlideProps {
  isActive: boolean;
}

export function ErrorSlide({ isActive }: ErrorSlideProps) {
  const { state, dispatch } = useApp();

  return (
    <SlideWrapper isActive={isActive} background="error">
      <div className="text-[15cqw] mb-6 animate-pulse">⚠️</div>
      <h2 className="text-[8cqw] font-serif mb-4">Oops!</h2>
      <p className="text-text-grey max-w-[80%] leading-relaxed mb-8">
        {state.error || "Couldn't read that. Try a fresh export or the demo."}
      </p>
      <Button onClick={() => dispatch({ type: 'GO_TO_SLIDE', payload: 0 })}>
        Back to upload
      </Button>
    </SlideWrapper>
  );
}

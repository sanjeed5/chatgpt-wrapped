import { SlideWrapper } from './SlideWrapper';
import { Spinner } from '../ui/Spinner';

interface LoadingSlideProps {
  isActive: boolean;
}

export function LoadingSlide({ isActive }: LoadingSlideProps) {
  return (
    <SlideWrapper isActive={isActive} background="dark">
      <Spinner />
      <h2 className="text-2xl font-semibold mt-6">Pulling up your year...</h2>
      <p className="text-text-grey mt-4 text-sm">Processing your conversations</p>
    </SlideWrapper>
  );
}

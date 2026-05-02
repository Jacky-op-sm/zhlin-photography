import type { TravelSliderCard } from '@/lib/types/travel-slider';
import TravelCardSlider from './TravelCardSlider';

type SpotSliderProps = {
  cards: TravelSliderCard[];
  cardBackgroundClassName?: string;
};

export default function SpotSlider({ cards, cardBackgroundClassName = 'bg-white' }: SpotSliderProps) {
  return (
    <TravelCardSlider
      cards={cards}
      variant="spot"
      cardBackgroundClassName={cardBackgroundClassName}
      openCardAriaLabelPrefix="Open card"
    />
  );
}

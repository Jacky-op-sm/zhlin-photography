import type { TravelSliderCard } from '@/lib/types/travel-slider';
import TravelCardSlider from './TravelCardSlider';

export default function FoodSlider({ cards }: { cards: TravelSliderCard[] }) {
  return (
    <TravelCardSlider
      cards={cards}
      variant="food"
      cardBackgroundClassName="bg-[rgba(245,245,247,1)]"
      openCardAriaLabelPrefix="Open food card"
    />
  );
}

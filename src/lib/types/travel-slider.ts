export type TravelSliderDetailBlock = {
  text: string;
  imageSrc: string;
  imageAlt: string;
};

export type TravelSliderCard = {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
  detailBlocks: TravelSliderDetailBlock[];
};

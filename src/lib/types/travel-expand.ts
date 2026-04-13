export type TravelExpandBlock = {
  imageSrc: string;
  body: string;
};

export type TravelExpandCard = {
  cardName: string;
  eyebrow: string;
  title: string;
  cardIndex: number;
  blocks: TravelExpandBlock[];
};

export type TravelExpandMap = Record<string, TravelExpandCard>;

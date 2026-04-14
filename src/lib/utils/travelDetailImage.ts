type TravelDetailImageClassOptions = {
  isPortrait: boolean;
  isIPadPortraitTouch: boolean;
};

export function getTravelDetailImageClass({
  isPortrait,
  isIPadPortraitTouch,
}: TravelDetailImageClassOptions) {
  if (isPortrait) {
    if (isIPadPortraitTouch) {
      return 'h-[clamp(19rem,54dvh,33rem)] max-h-[62vh] w-full object-cover object-[50%_40%]';
    }

    return 'h-[55vh] max-h-[86vh] w-full object-cover object-[50%_40%] sm:h-[70vh] lg:h-[86vh]';
  }

  return 'h-auto max-h-[50vh] w-full object-contain sm:max-h-[70vh] lg:max-h-none';
}

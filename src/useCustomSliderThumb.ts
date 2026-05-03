import { useSliderThumb, type AriaSliderThumbOptions } from "react-aria";
import type { ColorStops, useCustomSliderState } from "./useCustomSliderState";
import type { FocusableElement } from "@react-types/shared";

type CustomSliderThumbOptions = AriaSliderThumbOptions & {
  setSelected?: React.Dispatch<React.SetStateAction<ColorStops[number] | null>>;
};

export function useCustomSliderThumb(
  opts: CustomSliderThumbOptions,
  state: ReturnType<typeof useCustomSliderState>,
) {
  const sliderThumbAria = useSliderThumb(opts, state);
  const index = opts.index ?? 0;
  return {
    ...sliderThumbAria,
    thumbProps: {
      ...sliderThumbAria.thumbProps,
      style: {
        ...sliderThumbAria.thumbProps.style,
        background: state.value[index].color,
        zIndex: state.getThumbPercent(index + 1) === 1 ? state.values.length - index : undefined,
      },
      onPointerDown: (e: React.PointerEvent<FocusableElement>) => {
        sliderThumbAria.thumbProps.onPointerDown?.(e);
        opts.setSelected?.((prev) => {
          const colorStop = state.value[index];
          return colorStop.id === prev?.id ? null : colorStop;
        });
      },
    },
  };
}

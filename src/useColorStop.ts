import { useSliderThumb, type AriaSliderThumbOptions } from "react-aria";
import type { useGradientSliderState } from "./useGradientSliderState";
import type { FocusableElement } from "@react-types/shared";

type ColorStopOptions = AriaSliderThumbOptions & {
  setSelectedId?: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useColorStop(
  opts: ColorStopOptions,
  state: ReturnType<typeof useGradientSliderState>,
) {
  const sliderThumbAria = useSliderThumb(opts, state);
  const index = opts.index ?? 0;
  const colorStop = state.value[index];
  const lastIndex = state.value.length - 1;
  return {
    ...sliderThumbAria,
    thumbProps: {
      ...sliderThumbAria.thumbProps,
      style: {
        ...sliderThumbAria.thumbProps.style,
        background: colorStop.color,
        zIndex: state.isThumbDragging(index)
          ? lastIndex
          : state.getThumbPercent(index + 1) === 1
            ? lastIndex - index
            : 0,
      },
      onPointerDown: (e: React.PointerEvent<FocusableElement>) => {
        sliderThumbAria.thumbProps.onPointerDown?.(e);
        opts.setSelectedId?.(colorStop.id);
      },
    },
  };
}

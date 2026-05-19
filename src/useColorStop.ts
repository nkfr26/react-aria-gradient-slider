import type { FocusableElement } from "@react-types/shared";
import { type AriaSliderThumbOptions, useSliderThumb } from "react-aria";
import type { useGradientSliderState } from "./useGradientSliderState";

export function useColorStop(
  opts: AriaSliderThumbOptions,
  state: ReturnType<typeof useGradientSliderState>,
) {
  const sliderThumbAria = useSliderThumb(opts, state);
  const index = opts.index ?? 0;
  const colorStop = state.value[index]!;
  return {
    ...sliderThumbAria,
    thumbProps: {
      ...sliderThumbAria.thumbProps,
      style: {
        ...sliderThumbAria.thumbProps.style,
        zIndex:
          state.getThumbPercent(index + 1) === 1 || state.focusedThumb === index
            ? state.value.length - 1 - index
            : 0,
      },
      onPointerDown: (e: React.PointerEvent<FocusableElement>) => {
        sliderThumbAria.thumbProps.onPointerDown?.(e);
        state.setSelectedId?.(colorStop.id);
      },
    },
    background: colorStop.color,
  };
}

import { useSliderThumb, type AriaSliderThumbOptions } from "react-aria";
import type { useGradientSliderState } from "./useGradientSliderState";
import type { FocusableElement } from "@react-types/shared";

export function useColorStop(
  opts: AriaSliderThumbOptions,
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
        zIndex: state.getThumbPercent(index + 1) === 1 ? lastIndex - index : 0,
      },
      onPointerDown: (e: React.PointerEvent<FocusableElement>) => {
        sliderThumbAria.thumbProps.onPointerDown?.(e);
        state.setSelectedId?.(colorStop.id);
      },
    },
  };
}

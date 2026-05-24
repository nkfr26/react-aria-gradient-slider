import type { FocusableElement } from "@react-types/shared";
import type { RefObject } from "react";
import { type AriaSliderThumbProps, useSliderThumb } from "react-aria";
import type { GradientSliderState } from "./useGradientSliderState";
import type { Except } from "./utils";

export type AriaColorStopProps = Except<AriaSliderThumbProps, "index"> & { index: number };
export type AriaColorStopOptions = AriaColorStopProps & {
  trackRef: RefObject<Element | null>;
  inputRef: RefObject<HTMLInputElement | null>;
};

export function useColorStop(opts: AriaColorStopOptions, state: GradientSliderState) {
  const sliderThumbAria = useSliderThumb(opts, state);
  const index = opts.index;
  const colorStop = state.value[index];
  if (colorStop === undefined) {
    throw new Error("ColorStop index is out of bounds");
  }
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

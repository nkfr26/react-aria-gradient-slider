import { useRef } from "react";
import { formatHex, interpolate } from "culori";
import { useSliderState, type SliderStateOptions } from "react-stately";
import type { Except } from "type-fest";

type ColorStop = {
  id: string;
  value: number;
  color: string;
};

export type ColorStops = [ColorStop, ColorStop, ...ColorStop[]];

export type GradientSliderStateOptions = Except<
  SliderStateOptions<number[]>,
  "value" | "onChange"
> & {
  value: ColorStops;
  onChange: React.Dispatch<React.SetStateAction<ColorStops>>;
  setSelected?: React.Dispatch<React.SetStateAction<ColorStops[number] | null>>;
};

export function useGradientSliderState(props: GradientSliderStateOptions) {
  const { onChangeEnd, ...restProps } = props;
  const currentColorStopsRef = useRef<ColorStops>(props.value);
  const state = useSliderState({
    ...restProps,
    value: props.value.map((cs) => cs.value),
    onChange: (value) => {
      const newColorStops = currentColorStopsRef.current.map((cs, i) => ({
        ...cs,
        value: value[i],
      })) as ColorStops;
      currentColorStopsRef.current = newColorStops;
      props.onChange(newColorStops);
    },
  });

  const onChange: React.Dispatch<React.SetStateAction<ColorStops>> = (value) => {
    const newColorStops = typeof value === "function" ? value(currentColorStopsRef.current) : value;
    currentColorStopsRef.current = newColorStops;
    props.onChange(newColorStops);
  };

  const draggingRef = useRef(new Set<number>());

  const isThumbDragging = (index: number) => {
    return draggingRef.current.has(index);
  };

  const setThumbDragging = (index: number, dragging: boolean) => {
    if (dragging) {
      draggingRef.current.add(index);
    } else {
      if (!draggingRef.current.delete(index)) {
        return;
      }
    }
    state.setThumbDragging(index, dragging);

    if (draggingRef.current.size === 0) {
      onChangeEnd?.(currentColorStopsRef.current.map((cs) => cs.value));
    }
  };

  const getInterpolatedColor = (value: number, mode: "oklab" | "oklch", filterIndex?: number) => {
    const interpolator = interpolate(
      props.value
        .filter((_, index) => index !== filterIndex)
        .map((cs) => [cs.color, state.getValuePercent(cs.value)]),
      mode,
    );
    return formatHex(interpolator(state.getValuePercent(value)));
  };

  const removeColorStop = (id: string) => {
    if (props.value.length === 2) {
      return;
    }
    const newColorStops = props.value.filter((cs) => cs.id !== id) as ColorStops;
    currentColorStopsRef.current = newColorStops;
    props.onChange(newColorStops);
    props.setSelected?.((prev) => (prev?.id === id ? null : prev));
  };
  return {
    ...state,
    isThumbDragging,
    setThumbDragging,
    value: props.value,
    onChange,
    setSelected: props.setSelected,
    getInterpolatedColor,
    removeColorStop,
    canRemoveColorStop: 2 < props.value.length,
  };
}

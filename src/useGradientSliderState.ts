import { formatHex8, interpolate } from "culori";
import { parseColor, useSliderState, type Color, type SliderStateOptions } from "react-stately";
import { snapValueToStep } from "react-stately/private/utils/number";
import type { Except } from "./utils";

type ColorStop = { id: string; value: number; color: Color };

export type ColorStops = [ColorStop, ColorStop, ...ColorStop[]];

export type GradientSliderStateOptions = Except<
  SliderStateOptions<number[]>,
  "value" | "onChange"
> & {
  value: ColorStops;
  onChange: React.Dispatch<React.SetStateAction<ColorStops>>;
  mode: "oklab" | "oklch";
  setSelectedId?: React.Dispatch<React.SetStateAction<string | null>>;
};

export function useGradientSliderState(props: GradientSliderStateOptions) {
  const state = useSliderState({
    ...props,
    value: props.value.map((cs) => cs.value),
    onChange: (value) => {
      props.onChange((prev) => prev.map((cs, i) => ({ ...cs, value: value[i] })) as ColorStops);
    },
  });

  const privateGetInterpolatedColor = (value: number, filterIndex?: number) => {
    const interpolator = interpolate(
      props.value
        .filter((_, index) => index !== filterIndex)
        .map((cs) => [cs.color.toString("hexa"), state.getValuePercent(cs.value)]),
      props.mode,
    );
    return parseColor(formatHex8(interpolator(state.getValuePercent(value))));
  };

  const getAddedColorStops = (colorStop: ColorStop): ColorStops => {
    if (props.value.some((cs) => cs.value === colorStop.value)) {
      return props.value;
    }
    return [...props.value, colorStop].toSorted((a, b) => a.value - b.value) as ColorStops;
  };

  const setThumbPercentColor = (index: number, percent: number) => {
    props.onChange((prev) => {
      return prev.map((cs, i) => {
        if (i === index) {
          const value = snapValueToStep(
            state.getPercentValue(percent),
            state.getThumbMinValue(i),
            state.getThumbMaxValue(i),
            state.step,
          );
          const color = privateGetInterpolatedColor(value, i);
          return { ...cs, value, color };
        }
        return cs;
      }) as ColorStops;
    });
  };

  const removeColorStop = (id: string) => {
    if (props.value.length === 2) {
      return;
    }
    props.onChange(props.value.filter((cs) => cs.id !== id) as ColorStops);
    props.setSelectedId?.((prev) => (prev === id ? null : prev));
  };

  const updateColorStop = (id: string, updates: Partial<Except<ColorStop, "id">>) => {
    props.onChange(
      (prev) => prev.map((cs) => (cs.id === id ? { ...cs, ...updates } : cs)) as ColorStops,
    );
  };
  return {
    ...state,
    value: props.value,
    onChange: props.onChange,
    mode: props.mode,
    setSelectedId: props.setSelectedId,
    getInterpolatedColor: (value: number) => privateGetInterpolatedColor(value),
    getAddedColorStops,
    setThumbPercentColor,
    removeColorStop,
    canRemoveColorStop: 2 < props.value.length,
    updateColorStop,
  };
}
